import { sessionStore } from '@/entities/session/model';
import { TokenStore, tokenStore } from '@/entities/token/model';
import { Tokens } from '@/entities/token/types';
import { CurrentUserStore } from '@/entities/user/model/current-user-store';
import { handleAuthError } from '@/shared/api/errors/handle-auth-error';
import { isServer, WS_ORIGIN } from '@/shared/config';
import { SerializedError } from '@/shared/lib/serialized-error';
import { WebSocketClient } from '@/shared/lib/websocket';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { authRouteManager } from './auth-route-manager';

const WS_URL = `${WS_ORIGIN}/api/v1/ws/ws/session`;

export class AuthStore {
  authPromise: Promise<boolean> | null = null;
  buyVideoPromise: Promise<boolean> | null = null;
  abortController: AbortController | null = null;
  userStore: CurrentUserStore | null = null;
  tokenStore: TokenStore | null = null;
  isSignInModalOpen: boolean = false;
  loading: boolean = false;
  error: SerializedError | null = null;
  signInOptions: { ref?: React.RefObject<HTMLDivElement>; extra?: { videoId: string; action?: 'buy' } } | null = null;

  constructor(tokenStore: TokenStore) {
    makeAutoObservable(this);
    runInAction(() => {
      this.tokenStore = tokenStore;
    });

    if (tokenStore.hasToken) {
      this.userStore = new CurrentUserStore(tokenStore);
    }

    reaction(
      () => this.tokenStore?.access_token,
      async token => {
        if (token) {
          this.userStore = new CurrentUserStore(tokenStore);
        } else {
          this.userStore = null;
        }
      }
    );
  }
  signIn = async (requireRedirectToAuth: boolean = true, videoId?: string): Promise<boolean> => {
    if (videoId) {
      this.signInOptions = {
        extra: { videoId }
      };
    }
    
    if (requireRedirectToAuth) {
      authRouteManager.redirectTo('/auth');
    }
    return this.waitForAuth();
  };

  waitForAuth = async (): Promise<boolean> => {
    if (this.authPromise) {
      return this.authPromise;
    }

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    const videoId = this.signInOptions?.extra?.videoId;
    const session = await sessionStore.getSession(videoId, { forceValidation: true });

    if (signal.aborted) {
      return false;
    }

    this.authPromise = new Promise<boolean>(resolve => {
      const ws = new WebSocketClient(`${WS_URL}/${session?.id}`);
      ws.connect();

      const handleAbort = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        signal.removeEventListener('abort', handleAbort);
        runInAction(() => {
          this.abortController = null;
          this.authPromise = null;
        });
        ws.close();
      };

      signal.addEventListener('abort', handleAbort);

      ws.onMessage(data => {
        this.tokenStore?.processTokens(data as Tokens);
        resolve(true);
        cleanup();
      });

      ws.onError(() => {
        resolve(false);
        cleanup();
      });
    }).finally(() => {
      this.authPromise = null;
    });

    return this.authPromise;
  };

  waitForBuyVideo = async (): Promise<boolean> => {
    if (this.buyVideoPromise) {
      return this.buyVideoPromise;
    }

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    if (signal.aborted) {
      return false;
    }

    this.buyVideoPromise = new Promise(res => {
      //заглушка
      setTimeout(() => {
        res(false);
      }, 10000);
    });

    return this.buyVideoPromise;
  };
  //ToDo создать VideoStore хранилище для каждого видео, добавить в него метод buy()
  buyVideo = (requireRedirectToBuy: boolean = true): Promise<boolean> => {
    if (requireRedirectToBuy) {
      authRouteManager.redirectTo('/buy');
    }
    return this.waitForBuyVideo();
  };

  openSignInModal = (options?: {
    ref?: React.RefObject<HTMLDivElement>;
    extra?: { videoId: string; action?: 'buy' };
  }) => {
    runInAction(() => {
      this.signInOptions = options || null;
      this.isSignInModalOpen = true;
    });
  };

  closeSignInModal = () => {
    this.isSignInModalOpen = false;
  };

  logout = () => {
    runInAction(() => {
      this.tokenStore?.clearToken();
      this.userStore = null;
      this.isSignInModalOpen = false;
      this.signInOptions = null;
    });

    void this.tokenStore?.clearRefreshToken();
    void sessionStore.removeSessionWithCleanup();
  };

  refreshAccessToken = async (): Promise<boolean> => {
    //дождаться если уже обновляется
    return (await this.tokenStore?.refreshAccessToken()) ?? false;
  };

  handleAuthError = async (error: SerializedError, options?: { videoId?: string }): Promise<boolean> => {
    return handleAuthError(error, options);
  };

  get isAuth() {
    return this.tokenStore?.access_token !== null;
  }

  get isPro() {
    return this.user?.is_pro;
  }

  get user() {
    return this.userStore?.user;
  }

  get token() {
    return this.tokenStore?.access_token;
  }
}

//const access_token = isServer ? cookies().get('access_token')?.value : null;

export const authStore = isServer ? ({} as AuthStore) : new AuthStore(tokenStore);

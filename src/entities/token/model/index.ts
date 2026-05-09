import { isServer } from '@/shared/config';
import { cookies } from '@/shared/lib/cookies';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { tokenApi } from '../api';
import type { Tokens } from '../types';
import { ACCESS_TOKEN_KEY } from './constants';

export class TokenStore {
  access_token: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.access_token,
      token => {
        if (token) {
          cookies.set(ACCESS_TOKEN_KEY, token, { path: '/' });
        } else {
          cookies.remove(ACCESS_TOKEN_KEY);
        }
      }
    );

    this.loadTokensFromStorage();
  }

  loadTokensFromStorage = () => {
    const token = cookies.get(ACCESS_TOKEN_KEY);
    runInAction(() => {
      this.access_token = token || null;
    });
  };

  processTokens = async ({ access_token, refresh_token }: Tokens) => {
    runInAction(() => {
      this.access_token = access_token || null;
    });
    await this.saveRefreshToken(refresh_token);
  };
  saveRefreshToken = async (refresh_token: string) => {
    tokenApi.saveRefreshToken(refresh_token);
  };
  clearRefreshToken = async () => {
    try {
      await tokenApi.clearRefreshToken();
    } catch (error) {
      console.error('Не удалось очистить refresh token cookie', error);
    }
  };
  refreshAccessToken = async (): Promise<boolean> => {
    try {
      this.refreshPromise = (async () => {
        try {
          const result = await tokenApi.refreshAccessToken();
          if (result?.access_token) {
            runInAction(() => {
              this.access_token = result?.access_token || null;
            });
            return true;
          } else {
            throw new Error('Не удалось обновить токен');
          }
        } catch (err) {
          console.error(`Не удалось обновить токен: ${err}`);
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();

      return await this.refreshPromise;
    } catch (err) {
      console.error(`Ошибка при обработке refreshAccessToken: ${err}`);
      this.refreshPromise = null;
      return false;
    }
  };
  clearToken() {
    this.access_token = null;
  }
  getUserIdTokenBelongsTo = async () => {
    return await tokenApi.getUserIdTokenBelongsTo();
  };

  get hasToken() {
    return this.access_token !== null;
  }

  get isAuth() {
    return this.access_token !== null;
  }
}

export const tokenStore = isServer ? ({} as TokenStore) : new TokenStore();

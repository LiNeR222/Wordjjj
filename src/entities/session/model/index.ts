import { sessionsApi } from '@/entities/session/api';
import { isServer } from '@/shared/config';
import { SerializedError } from '@/shared/lib/serialized-error';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { Session } from '../types';

// Функция для получения параметров URL на клиентской стороне
const getURLParams = () => {
  if (isServer) return {};
  
  const searchParams = new URLSearchParams(window.location.search);
  const videoId = searchParams.get('videoId');
  
  // Также проверяем путь URL на наличие ID видео (формат /video/123)
  let pathVideoId = null;
  const pathMatch = window.location.pathname.match(/\/video\/(\d+)/);
  if (pathMatch) {
    pathVideoId = pathMatch[1];
  }
  
  // Используем videoId из параметров URL или из пути
  const effectiveVideoId = videoId || pathVideoId;
  
  return { videoId: effectiveVideoId || undefined };
};

interface EnsureSessionOptions {
  force?: boolean;
  createIfMissing?: boolean;
  videoId?: string;
}

interface GetSessionOptions {
  forceValidation?: boolean;
  createIfMissing?: boolean;
}

class SessionStore {
  instance: Session | null = null;
  error: SerializedError | null = null;
  sessionUpdateTimer: NodeJS.Timeout | null = null;

  // Флаг для предотвращения рекурсивных вызовов updateSession
  private isUpdatingSession = false;
  private urlParams: { videoId?: string } = {};
  private sessionValidationPromise: Promise<void> | null = null;
  private lastSessionValidationAt: number | null = null;
  private readonly sessionValidationTtlMs = 60 * 1000;

  constructor() {
    makeAutoObservable(this);

    // Получаем параметры URL при инициализации
    if (!isServer) {
      this.urlParams = getURLParams();
    }

    // Реакция на изменение this.instance
    reaction(
      () => this.instance,
      (session) => {
        if (session) {
          this.saveSessionToStorage();
          this.startSessionAutoUpdate();
        }
      }
    );

    // Загрузка сессии из localStorage при инициализации
    this.loadSessionFromStorage();
  }

  private clearSessionState = (): void => {
    runInAction(() => {
      this.instance = null;
      this.lastSessionValidationAt = null;
    });

    if (this.sessionUpdateTimer) {
      clearTimeout(this.sessionUpdateTimer);
      this.sessionUpdateTimer = null;
    }

    if (!isServer) {
      try {
        localStorage.removeItem('session');
      } catch (error) {
        console.error('Ошибка при удалении сессии из localStorage:', error);
      }
    }
  };

  loadSessionFromStorage = (): void => {
    if (isServer) return;
    try {
      const session = localStorage.getItem('session');
      runInAction(() => {
        this.instance = session ? JSON.parse(session) : null;
      });

      const canCreateMissingSession = !window.location.pathname.includes('/video/');
      void this.ensureValidSession({
        force: true,
        createIfMissing: canCreateMissingSession || Boolean(this.instance),
      });
    } catch (error) {
      console.error('Ошибка при загрузке сессии из localStorage:', error);
    }
  };

  saveSessionToStorage = (): void => {
    if (isServer) return;

    if (this.instance) {
      try {
        localStorage.setItem('session', JSON.stringify(this.instance));
      } catch (error) {
        console.error('Ошибка при сохранении сессии в localStorage:', error);
      }
    }
  };

  createSession = async (videoId?: string): Promise<void> => {
    try {
      const session = await sessionsApi.createSession(videoId);
      runInAction(() => {
        this.instance = session;
        this.lastSessionValidationAt = Date.now();
      });
    } catch (error) {
      console.error('Ошибка при создании сессии:', error);
    }
  };

  ensureValidSession = async ({
    force = false,
    createIfMissing = true,
    videoId,
  }: EnsureSessionOptions = {}): Promise<void> => {
    if (isServer) return;

    const effectiveVideoId = videoId || this.urlParams.videoId;

    if (
      !force &&
      this.instance &&
      !this.isSessionExpired &&
      this.lastSessionValidationAt &&
      Date.now() - this.lastSessionValidationAt < this.sessionValidationTtlMs
    ) {
      return;
    }

    if (this.sessionValidationPromise) {
      return this.sessionValidationPromise;
    }

    this.sessionValidationPromise = (async () => {
      if (!this.instance || this.isSessionExpired) {
        if (createIfMissing) {
          await this.createSession(effectiveVideoId);
        } else {
          this.clearSessionState();
        }
        return;
      }

      try {
        const validatedSession = await sessionsApi.getSession(this.instance.id);
        runInAction(() => {
          this.instance = validatedSession;
          this.lastSessionValidationAt = Date.now();
        });
      } catch (error) {
        console.warn('Локальная сессия невалидна на бэке, пересоздаём:', error);
        this.clearSessionState();
        if (createIfMissing) {
          await this.createSession(effectiveVideoId);
        }
      }
    })().finally(() => {
      this.sessionValidationPromise = null;
    });

    return this.sessionValidationPromise;
  };

  updateSession = async (): Promise<void> => {
    //защита от рекурсивных вызовов
    if (this.isUpdatingSession) {
      console.log('Обновление сессии уже выполняется');
      return;
    }

    this.isUpdatingSession = true;

    try {
      if (!this.instance || this.isSessionExpired) {
        console.log('Сессия отсутствует или просрочена. Создание новой сессии.');
        await this.createSession(this.urlParams.videoId);
        return;
      }

      console.log('Попытка обновить сессию:', { id: this.instance.id });

      const session = await sessionsApi.updateSessionLifeTime(this.instance.id);
      runInAction(() => {
        this.instance = session;
      });

      console.log('Сессия успешно обновлена:', { expiresAt: session.expires_at });
    } catch (error) {
      console.error('Ошибка при обновлении сессии:', error);
      console.log('Попытка создания новой сессии после ошибки.');
      await this.createSession(this.urlParams.videoId);
    } finally {
      this.isUpdatingSession = false;
    }
  };

  getSession = async (videoId?: string, options: GetSessionOptions = {}): Promise<Session> => {
    if (!isServer) {
      this.updateURLParams();
    }

    const effectiveVideoId = videoId || this.urlParams.videoId;

    await this.ensureValidSession({
      force: options.forceValidation ?? false,
      createIfMissing: options.createIfMissing ?? true,
      videoId: effectiveVideoId,
    });

    if (!this.instance && (options.createIfMissing ?? true)) {
      await this.createSession(effectiveVideoId);
    }

    if (!this.instance) {
      throw new Error('Не удалось получить сессию');
    }

    return this.instance!;
  };

  startSessionAutoUpdate = (): void => {
    if (this.sessionUpdateTimer) {
      clearTimeout(this.sessionUpdateTimer);
    }

    if (!this.instance?.expires_at) {
      console.log('Невозможно запустить автообновление: expires_at отсутствует');
      return;
    }

    const expiresAt = new Date(this.instance.expires_at + 'Z').getTime();
    const now = Date.now();
    const updateBeforeMs = 60 * 1000; // Обновляем за 1 минуту до истечения
    const timeUntilUpdate = expiresAt - now - updateBeforeMs;

    if (timeUntilUpdate > 0) {
      console.log(`Запуск таймера автообновления сессии через ${timeUntilUpdate} мс`);
      this.sessionUpdateTimer = setTimeout(() => {
        this.updateSession();
      }, timeUntilUpdate);
    } else {
      console.log('Время обновления сессии уже истекло. Немедленное обновление.');
      this.updateSession();
    }
  };

  removeSession = (): void => {
    this.clearSessionState();
  };

  removeSessionWithCleanup = async (): Promise<void> => {
    const sessionId = this.instance?.id;
    this.clearSessionState();

    if (sessionId) {
      try {
        await sessionsApi.deleteSession(sessionId);
      } catch (error) {
        console.warn(`Не удалось удалить сессию ${sessionId} на бэке`, error);
      }
    }
  };

  get isSessionExpired(): boolean {
    if (!this.instance?.id) return true;

    const expiresDate = new Date(this.instance.expires_at + 'Z');
    if (isNaN(expiresDate.getTime())) {
      console.error('Невалидная дата expires_at:', this.instance.expires_at);
      return true;
    }

    return new Date() > expiresDate;
  }

  get session(): Session | null {
    return this.instance;
  }

  updateURLParams = (): void => {
    if (isServer) return;
    
    const newParams = getURLParams();
    this.urlParams = newParams;
  };
  
  forceCreateNewSession = async (): Promise<void> => {
    console.log('[SessionStore] Forcing creation of new session with videoId:', this.urlParams.videoId);
    this.clearSessionState();
    await this.createSession(this.urlParams.videoId);
  };
}

export const sessionStore = new SessionStore();

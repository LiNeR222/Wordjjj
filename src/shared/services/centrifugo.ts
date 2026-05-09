import { Centrifuge, type Subscription, type PublicationContext, type ErrorContext } from 'centrifuge';

/**
 * Сервис для работы с Centrifugo
 */
export class CentrifugoService {
  private centrifuge: Centrifuge | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private wsEndpoint: string;

  /**
   * @param wsEndpoint
   */
  constructor(wsEndpoint: string = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/connection/websocket`) {
    this.wsEndpoint = wsEndpoint;
  }

  /**
   * Инициализирует соединение с Centrifugo
   * @param token Токен для авторизации
   */
  init(token: string): void {
    if (this.centrifuge) {
      this.disconnect();
    }

    this.centrifuge = new Centrifuge(this.wsEndpoint);
    this.centrifuge.setToken(token);

    this.centrifuge.on('connected', () => {
      console.log('Connected to Centrifugo');
    });

    this.centrifuge.on('disconnected', () => {
      console.log('Disconnected from Centrifugo');
    });

    this.centrifuge.on('error', (ctx: ErrorContext) => {
      console.error('Centrifugo error:', ctx);
    });

    this.centrifuge.connect();
  }

  /**
   * Подписывается на канал
   * @param channel Имя канала
   * @param callback Функция обработки сообщений
   * @returns Объект подписки
   */
  subscribe<T>(channel: string, callback: (data: T) => void): Subscription {
    if (!this.centrifuge) {
      throw new Error('Centrifugo не инициализирован');
    }

    if (this.subscriptions.has(channel)) {
      return this.subscriptions.get(channel)!;
    }

    const subscription = this.centrifuge!.newSubscription(channel);
    
    subscription.subscribe();

    subscription.on('publication', (ctx: PublicationContext) => {
      callback(ctx.data as T);
    });

    subscription.on('error', (ctx: ErrorContext) => {
      console.error(`Ошибка подписки на канал ${channel}:`, ctx);
    });

    this.subscriptions.set(channel, subscription);
    return subscription;
  }

  /**
   * Отписывается от канала
   * @param channel Имя канала
   */
  unsubscribe(channel: string): void {
    const subscription = this.subscriptions.get(channel);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channel);
    }
  }

  /**
   * Закрывает соединение с Centrifugo
   */
  disconnect(): void {
    if (this.centrifuge) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.centrifuge.disconnect();
      this.centrifuge = null;
    }
  }
}

export const centrifugoService = typeof window !== 'undefined' 
  ? new CentrifugoService() 
  : ({} as CentrifugoService);
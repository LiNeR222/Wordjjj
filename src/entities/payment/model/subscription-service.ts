/**
 * Сервис для работы с подписками.
 * Отвечает за логику подписки на каналы и обработку платежей.
 */
import { authStore } from '@/entities/auth/model/authStore';
import { paymentStore } from './payment-store';
import { SerializedError } from '@/shared/lib/serialized-error';

interface SubscriptionResult {
  success: boolean;
  error?: SerializedError | Error;
  redirectUrl?: string;
}

export class SubscriptionService {
  /**
   * Получает список доступных каналов пользователя для подписки
   */
  async getUserChannels(userId: number): Promise<number | null> {
    try {
      // Здесь позже будет запрос к API для получения списка каналов
      // и был выбор, на какой оформить подписку
      
      // Пока используем ID пользователя как ID канала
      return userId;
    } catch (error) {
      console.error('Ошибка при получении каналов пользователя:', error);
      return null;
    }
  }

  /**
   * Проверяет авторизацию пользователя
   */
  checkUserAuth(): boolean {
    return Boolean(authStore?.isAuth && authStore?.user?.id);
  }

  /**
   * Открывает окно авторизации
   */
  openAuthModal(): void {
    authStore.openSignInModal();
  }

  /**
   * Создает подписку для канала
   * @param returnUrl URL для возврата после оплаты
   */
  async purchaseSubscription(returnUrl: string): Promise<SubscriptionResult> {
    if (!this.checkUserAuth()) {
      this.openAuthModal();
      return { success: false, error: new Error('Пользователь не авторизован') };
    }

    try {
      const userId = authStore.user?.id;
      if (!userId) {
        return { success: false, error: new Error('ID пользователя не найден') };
      }

      const channelId = await this.getUserChannels(userId);
      if (!channelId) {
        return { success: false, error: new Error('Не удалось определить канал для подписки') };
      }

      const result = await paymentStore.createSubscription(channelId, returnUrl);
      
      if (result?.payment_url) {
        return { 
          success: true, 
          redirectUrl: result.payment_url 
        };
      }
      
      return { 
        success: false, 
        error: new Error('Не удалось создать платежную ссылку')
      };
    } catch (error) {
      const serializedError = error as SerializedError;
      return {
        success: false,
        error: serializedError
      };
    }
  }
}

export const subscriptionService = new SubscriptionService(); 
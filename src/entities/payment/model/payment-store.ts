import { makeAutoObservable, runInAction } from 'mobx';
import { CreateSubscriptionParams, PaymentFailResponse, PaymentSuccessResponse, paymentApi } from '../api';
import { SerializedError } from '@/shared/lib/serialized-error';

/**
 * Хранилище состояния для работы с платежами и подписками
 */
export class PaymentStore {
  loading: boolean = false;
  error: SerializedError | null = null;
  paymentUrl: string | null = null;
  paymentSuccessMessage: string | null = null;
  paymentErrorMessage: string | null = null;
  paymentStatus: string | null = null;
  paymentErrorCode: string | null = null;
  showPaymentModal: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Создает подписку для указанного канала
   * @param channelId - ID канала для подписки
   * @param returnUrl - URL для возврата после оплаты
   * @returns Объект с URL платежа или null в случае ошибки
   */
  createSubscription = async (channelId: number, returnUrl: string) => {
    this.loading = true;
    this.error = null;
    
    try {
      const params: CreateSubscriptionParams = {
        channel_id: channelId,
        return_url: returnUrl,
        use_as_is: true
      };
      
      const result = await paymentApi.createSubscription(params);
      
      runInAction(() => {
        this.paymentUrl = result.payment_url;
      });
      
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        throw new Error('Не удалось получить URL для оплаты');
      }
      
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error as SerializedError;
      });
      
      console.error('Ошибка при создании подписки:', error);
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  /**
   * Подтверждает успешный платеж
   * @returns Информация об успешном платеже или null в случае ошибки
   */
  confirmPaymentSuccess = async (): Promise<PaymentSuccessResponse | null> => {
    this.loading = true;
    this.error = null;
    
    try {
      const result = await paymentApi.confirmPaymentSuccess();
      
      runInAction(() => {
        this.paymentStatus = result.status;
        this.paymentSuccessMessage = result.message;
        this.showPaymentModal = true;
      });
      
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error as SerializedError;
      });
      
      console.error('Ошибка при подтверждении успешного платежа:', error);
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  /**
   * Подтверждает неудачный платеж
   * @returns Информация о неудачном платеже или null в случае ошибки
   */
  confirmPaymentFail = async (): Promise<PaymentFailResponse | null> => {
    this.loading = true;
    this.error = null;
    
    try {
      const result = await paymentApi.confirmPaymentFail();
      
      runInAction(() => {
        this.paymentStatus = result.status;
        this.paymentErrorMessage = result.message;
        this.paymentErrorCode = result.error_code || null;
        this.showPaymentModal = true;
      });
      
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error as SerializedError;
      });
      
      console.error('Ошибка при подтверждении неудачного платежа:', error);
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  /**
   * Проверяет статус платежа по URL параметрам
   * @returns true если был обработан платеж, false в противном случае
   */
  checkPaymentReturnStatus = async () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const pathname = window.location.pathname;
      
      const paymentStatus = url.searchParams.get('payment_status');
      const paymentSuccess = url.searchParams.get('success');
      const paymentError = url.searchParams.get('fail');

      let hasSuccessPath = false;
      let hasFailPath = false;
      
      url.searchParams.forEach((value, key) => {
        if (value.includes('/success') || key.includes('/success')) {
          hasSuccessPath = true;
        }
        if (value.includes('/fail') || key.includes('/fail')) {
          hasFailPath = true;
        }
      });

      if (pathname === '/success') {
        hasSuccessPath = true;
      }
      if (pathname === '/fail') {
        hasFailPath = true;
      }
      
      const cleanUrl = () => {
        const modalParam = url.searchParams.get('modal');
        
        url.searchParams.delete('payment_status');
        url.searchParams.delete('success');
        url.searchParams.delete('fail');
        
        if (pathname === '/success' || pathname === '/fail') {
          const newUrl = new URL(window.location.origin);
          if (modalParam) {
            newUrl.searchParams.set('modal', modalParam);
          }
          window.history.replaceState({}, '', newUrl.toString());
        } else {
          window.history.replaceState({}, '', url.toString());
        }
      };

      try {
        if (paymentStatus === 'success' || paymentSuccess === 'true' || paymentSuccess === '1' || hasSuccessPath) {
          await this.confirmPaymentSuccess();
          cleanUrl();
          return true;
        } else if (paymentStatus === 'fail' || paymentError === 'true' || paymentError === '1' || hasFailPath) {
          await this.confirmPaymentFail();
          cleanUrl();
          return true;
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса платежа:', error);
        cleanUrl();
      }
    }
    
    return false;
  };

  /**
   * Закрывает модальное окно с информацией о платеже
   */
  closePaymentModal = () => {
    this.showPaymentModal = false;
  };

  /**
   * Сбрасывает состояние платежа
   */
  reset = () => {
    this.paymentUrl = null;
    this.error = null;
    this.paymentStatus = null;
    this.paymentSuccessMessage = null;
    this.paymentErrorMessage = null;
    this.paymentErrorCode = null;
    this.showPaymentModal = false;
  };
}

export const paymentStore = new PaymentStore(); 
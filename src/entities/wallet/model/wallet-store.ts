import { makeAutoObservable, runInAction, reaction } from 'mobx';
import { walletApi } from '../api';
import { channelService } from './channel-service';
import { authStore } from '@/entities/auth/model/authStore';
import { tariffStore } from '@/entities/tariff';

class WalletStore {
  ammount: number | null = null;
  walletId: number | null = null;
  channelId: number | null = null;
  isLoading = false;
  error: string | null = null;
  
  showDepositModal = false;
  disposers: Array<() => void> = [];
  authCheckInProgress = false;
  isInitialized = false;

  constructor() {
    makeAutoObservable(this);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.handleWindowFocus);
      
      this.disposers.push(
        reaction(
          () => authStore.isAuth,
          (isAuth) => {
            if (isAuth) {
              if (!this.isInitialized) {
                this.initializeWithDelay();
              }
            } else {
              runInAction(() => {
                this.ammount = null;
                this.walletId = null;
                this.channelId = null;
                this.isInitialized = false;
              });
            }
          },
          { fireImmediately: false }
        )
      );

      setTimeout(() => {
        this.initializeWithDelay();
      }, 500);
    }
  }
  
  /**
   * Обработчик события фокуса окна
   * Обновляет баланс кошелька, когда пользователь возвращается на страницу
   */
  handleWindowFocus = () => {
    if (authStore.isAuth) {
      this.refreshWalletData();
    }
  };

  /**
   * Инициализация хранилища с задержкой для гарантированной загрузки данных авторизации
   */
  initializeWithDelay = async () => {
    if (this.isInitialized || this.authCheckInProgress) {
      return;
    }
    
    runInAction(() => {
      this.authCheckInProgress = true;
    });
    
    if (authStore.authPromise) {
      try {
        await authStore.authPromise;
      } catch (error) {
        console.warn('Ожидание авторизации завершилось ошибкой:', error);
      }
    }
    
    try {
      if (authStore.isAuth && authStore.token) {
        await this.fetchBalance();
        runInAction(() => {
          this.isInitialized = true;
        });
      }
    } catch (error) {
      console.error('Ошибка при инициализации walletStore:', error);
    } finally {
      runInAction(() => {
        this.authCheckInProgress = false;
      });
      
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const modal = url.searchParams.get('modal');
        if (modal === 'deposit') {
          this.showDepositModal = true;
        }
      }
    }
  };

  /**
   * Обновляет данные кошелька и информацию о выживаемости
   * @param force Принудительная загрузка, игнорируя состояние isInitialized
   */
  refreshWalletData = async (force = true) => {
    if (this.isLoading) return;
    
    if (!authStore.isAuth || !authStore.token) {
      console.warn('Попытка обновить данные кошелька без авторизации');
      return;
    }
    
    try {
      if (this.isInitialized && !force) {
        return;
      }
      
      await this.fetchBalance();
      
      const channelId = await this.getChannelId();
      if (channelId) {
        await tariffStore.fetchWalletSurvivalInfo(channelId);
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных кошелька:', error);
    }
  };

  /**
   * Получает ID канала пользователя
   */
  getChannelId = async (): Promise<number | null> => {
    if (this.channelId) {
      return this.channelId;
    }
    
    try {
      if (!authStore.isAuth || !authStore.token) {
        console.warn('Запрос ID канала без авторизации');
        return null;
      }
      
      const channelId = await channelService.getUserChannel();
      if (channelId) {
        runInAction(() => {
          this.channelId = channelId;
        });
      }
      return channelId;
    } catch (error) {
      console.error('Ошибка при получении ID канала:', error);
      return null;
    }
  };

  /**
   * Загружает баланс кошелька канала
   */
  fetchBalance = async () => {
    if (!authStore.isAuth || !authStore.token) {
      console.warn('Попытка загрузить баланс без авторизации');
      return;
    }
    
    if (authStore.isAuth && !authStore.user) {
      try {
        const success = await authStore.refreshAccessToken();
        if (!success) {
          console.warn('Не удалось обновить токен доступа');
          return;
        }
      } catch (error) {
        console.error('Ошибка при обновлении токена:', error);
        return;
      }
    }
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const channelId = await this.getChannelId();
      
      if (!channelId) {
        throw new Error('Не удалось определить ID канала');
      }
      
      const response = await walletApi.getWalletBalance(channelId);
      
      runInAction(() => {
        this.ammount = response.ammount;
        this.walletId = response.id;
        this.error = null;
        this.isInitialized = true;
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
      runInAction(() => {
        this.error = 'Не удалось загрузить баланс';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  /**
   * Создает запрос на пополнение баланса кошелька
   */
  depositToWallet = async (amount: number) => {
    try {
      const channelId = await this.getChannelId();
      
      if (!channelId) {
        console.error('Channel ID is not set');
        return { success: false, error: 'ID канала не установлен' };
      }
      
      this.isLoading = true;
      const returnUrl = window.location.href;
      
      const response = await walletApi.depositToWallet({
        channel_id: channelId,
        amount,
        return_url: returnUrl
      });
      
      window.location.href = response.payment_url;
      return { success: true };
    } catch (error) {
      console.error('Error creating deposit:', error);
      runInAction(() => {
        this.error = 'Не удалось создать платеж';
      });
      return { success: false, error: this.error };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  openDepositModal = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('modal', 'deposit');
      window.history.pushState({}, '', url);
    }
    this.showDepositModal = true;
  };

  closeDepositModal = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('modal');
      window.history.pushState({}, '', url);
    }
    this.showDepositModal = false;
  };
  
  dispose = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.handleWindowFocus);
    }
    
    this.disposers.forEach(dispose => dispose());
    this.disposers = [];
  };
}

export const walletStore = new WalletStore(); 
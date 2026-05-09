import { makeAutoObservable, runInAction, reaction } from 'mobx';
import { tariffApi } from '../api';
import { Tariff, WalletSurvivalInfo } from '../types';
import { authStore } from '@/entities/auth/model/authStore';
import { walletStore } from '@/entities/wallet';

class TariffStore {
  currentTariff: Tariff | null = null;
  walletSurvivalInfo: WalletSurvivalInfo | null = null;
  isLoading = false;
  isSurvivalInfoLoading = false;
  error: string | null = null;
  disposers: Array<() => void> = [];
  isInitialized = false;
  authCheckInProgress = false;
  
  constructor() {
    makeAutoObservable(this);
    
    if (typeof window !== 'undefined') {
      this.disposers.push(
        reaction(
          () => authStore.isAuth,
          (isAuth) => {
            if (!isAuth && this.currentTariff) {
              runInAction(() => {
                this.isInitialized = false;
                this.walletSurvivalInfo = null;
              });
            }
            
            if (!this.isInitialized) {
              this.initializeWithDelay();
            }
          },
          { fireImmediately: false }
        )
      );
      
      setTimeout(() => {
        this.initializeWithDelay();
      }, 700);
    }
  }
  
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
        const channelId = await walletStore.getChannelId();
        
        if (channelId) {
          await this.fetchTariff(channelId);
          await this.fetchWalletSurvivalInfo(channelId);
          runInAction(() => {
            this.isInitialized = true;
          });
          return;
        }
      }
      
      await this.fetchDefaultTariff();
    } catch (error) {
      console.error('Ошибка при инициализации tariffStore:', error);
      await this.fetchDefaultTariff();
    } finally {
      runInAction(() => {
        this.authCheckInProgress = false;
      });
    }
  };
  
  /**
   * Загружает тариф по умолчанию (для неавторизованных пользователей)
   */
  fetchDefaultTariff = async () => {
    this.isLoading = true;
    this.error = null;
    
    try {
      const tariff = await tariffApi.getTariffByChannelId(null);
      
      runInAction(() => {
        this.currentTariff = tariff;
        this.error = null;
        this.isInitialized = true;
      });
      
      return tariff;
    } catch (error) {
      console.error('Error fetching default tariff:', error);
      runInAction(() => {
        this.error = 'Не удалось загрузить информацию о тарифе';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
  
  /**
   * Загружает информацию о тарифе по ID канала
   * Принудительно загружает тариф, игнорируя состояние isInitialized
   * @param force Принудительная загрузка, игнорируя состояние isInitialized
   */
  refreshTariff = async (force = true) => {
    if (this.isLoading) return null;
    
    if (!authStore.isAuth || !authStore.token) {
      return this.fetchDefaultTariff();
    }
    
    try {
      const channelId = await walletStore.getChannelId();
      if (channelId) {
        return this.fetchTariff(channelId, force);
      }
      return this.fetchDefaultTariff();
    } catch (error) {
      console.error('Ошибка при обновлении тарифа:', error);
      return null;
    }
  };
  
  /**
   * Загружает информацию о тарифе по ID канала
   * @param channelId ID канала пользователя
   * @param force Принудительная загрузка, игнорируя состояние isInitialized
   */
  fetchTariff = async (channelId: number, force = false) => {
    if (!channelId) {
      return this.fetchDefaultTariff();
    }
    
    if (this.isInitialized && !force) {
      return this.currentTariff;
    }
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const tariff = await tariffApi.getTariffByChannelId(channelId);
      
      runInAction(() => {
        this.currentTariff = tariff;
        this.error = null;
        this.isInitialized = true;
      });
      
      return tariff;
    } catch (error) {
      console.error('Error fetching tariff:', error);
      runInAction(() => {
        this.error = 'Не удалось загрузить информацию о тарифе';
      });
      
      return this.fetchDefaultTariff();
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  /**
   * Загружает информацию о выживаемости баланса (на сколько дней хватит)
   * @param channelId ID канала пользователя
   */
  fetchWalletSurvivalInfo = async (channelId: number) => {
    if (!authStore.isAuth || !authStore.token) {
      console.warn('Попытка получить информацию о выживаемости без авторизации');
      return null;
    }
    
    this.isSurvivalInfoLoading = true;
    
    try {
      const survivalInfo = await tariffApi.getWalletSurvivalDays(channelId);
      
      runInAction(() => {
        this.walletSurvivalInfo = survivalInfo;
      });
      
      return survivalInfo;
    } catch (error) {
      console.error('Error fetching wallet survival info:', error);
      runInAction(() => {
        this.walletSurvivalInfo = null;
      });
      return null;
    } finally {
      runInAction(() => {
        this.isSurvivalInfoLoading = false;
      });
    }
  };
  
  /**
   * Очистка ресурсов при уничтожении хранилища
   */
  dispose = () => {
    this.disposers.forEach(dispose => dispose());
    this.disposers = [];
  };
}

export const tariffStore = new TariffStore(); 
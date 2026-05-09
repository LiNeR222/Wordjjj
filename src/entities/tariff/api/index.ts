import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';
import { Tariff } from '../types';
import { WalletSurvivalInfo } from '../types';

const SERVICE_URL = `${apiUrl}/tarifs`;

export class TariffApi extends BaseApi {
  /**
   * Получает информацию о тарифе по ID канала
   * Если channelId не указан или равен null, возвращает последний активный тариф
   * @param channelId ID канала или null для получения последнего активного тарифа
   * @returns Объект с информацией о тарифе
   */
  getTariffByChannelId = async (channelId: number | null = null): Promise<Tariff> =>
    this.publicApi.get(`${SERVICE_URL}/${channelId ?? 'default'}`);
    
  /**
   * Получает информацию о выживаемости кошелька (на сколько дней хватит баланса)
   * @param channelId ID канала
   * @returns Информация о выживаемости кошелька
   */
  getWalletSurvivalDays = async (channelId: number): Promise<WalletSurvivalInfo> =>
    this.privateApi.get(`${SERVICE_URL}/${channelId}/wallet-days`);
}

export const tariffApi = new TariffApi(); 
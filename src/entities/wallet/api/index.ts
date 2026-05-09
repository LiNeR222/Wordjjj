import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';

const SERVICE_URL = `${apiUrl}/wallets`;

export interface WalletBalance {
  id: number;
  ammount: number;
}

export interface DepositRequestData {
  channel_id: number;
  amount: number;
  return_url?: string;
}

export interface DepositResponse {
  payment_url: string;
  payment_id: string;
  status: string;
  amount: number;
  channel_id: number;
}

export class WalletApi extends BaseApi {
  getWalletBalance = async (channel_id: number): Promise<WalletBalance> =>
    this.privateApi.get(`${SERVICE_URL}/${channel_id}`);

  depositToWallet = async (data: DepositRequestData): Promise<DepositResponse> =>
    this.privateApi.post(`${apiUrl}/payments/wallet/deposit`, data);
}

export const walletApi = new WalletApi(); 
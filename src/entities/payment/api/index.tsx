import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';

export interface CreateSubscriptionParams {
  channel_id: number;
  return_url: string;
  use_as_is?: boolean;
}

export interface CreateSubscriptionResponse {
  payment_url: string;
}

export interface PaymentSuccessResponse {
  status: string;
  message: string;
}

export interface PaymentFailResponse {
  status: string;
  message: string;
  error_code?: string;
}

const SERVICE_URL = `${apiUrl}/payments`;

export class PaymentApi extends BaseApi {
  createSubscription = async (params: CreateSubscriptionParams): Promise<CreateSubscriptionResponse> =>
    await this.privateApi.post(`${SERVICE_URL}/subscriptions/create`, params);
    
  confirmPaymentSuccess = async (): Promise<PaymentSuccessResponse> =>
    await this.privateApi.get(`${SERVICE_URL}/success`);
    
  confirmPaymentFail = async (): Promise<PaymentFailResponse> =>
    await this.privateApi.get(`${SERVICE_URL}/fail`);
}

export const paymentApi = new PaymentApi(); 
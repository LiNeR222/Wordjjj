import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';
import type { SubscribeOptions, Subscription, SubscriptionStatusResponse } from '../types';

const SERVICE_URL = `${apiUrl}/channels`;

export class ChannelApi extends BaseApi {
  getSubscription = async (channelId: number): Promise<Subscription> =>
    await this.privateApi.get(`${SERVICE_URL}/channel/${channelId}/subscription`);
  subscribe = async (channelId: number, params: SubscribeOptions): Promise<SubscriptionStatusResponse> =>
    await this.privateApi.post(`${SERVICE_URL}/channel/${channelId}/subscribe`, null, { params });
  unsubscribe = async (channelId: number): Promise<SubscriptionStatusResponse> =>
    await this.privateApi.post(`${SERVICE_URL}/channel/${channelId}/unsubscribe`);
}

export const channelApi = new ChannelApi();

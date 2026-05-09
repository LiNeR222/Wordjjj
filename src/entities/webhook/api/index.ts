import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';
import { SWebhookCreateRequest, SWebhookInfoResponse, WebhookEventType, WebhookListResponse } from '../types';

const SERVICE_URL = `${apiUrl}/webhooks`;

export class WebhookApi extends BaseApi {
  createWebhook = async (data: SWebhookCreateRequest): Promise<SWebhookInfoResponse> =>
    this.privateApi.post(`${SERVICE_URL}`, data);

  getWebhooks = async (offset: number = 0, limit: number = 20): Promise<WebhookListResponse> =>
    this.privateApi.get(`${SERVICE_URL}?offset=${offset}&limit=${limit}`);

  getWebhooksByVideoId = async (videoId: number): Promise<SWebhookInfoResponse[]> => {
    const response = await this.getWebhooks();
    return response.items.filter(webhook => 
      webhook.target_type === 'video' && webhook.target_id === videoId
    );
  };

  getWebhooksByChannelId = async (channelId: number): Promise<SWebhookInfoResponse[]> => {
    const response = await this.getWebhooks();
    return response.items.filter(webhook => 
      webhook.target_type === 'channel' && webhook.target_id === channelId
    );
  };

  createVideoWebhook = async (
    videoId: number, 
    url: string, 
    eventType: WebhookEventType = 'view_start'
  ): Promise<SWebhookInfoResponse> => {
    if (eventType === 'subscribe') {
      throw new Error("Для триггера 'subscribe' используйте метод createChannelWebhook");
    }
    
    const webhookData: SWebhookCreateRequest = {
      url: url,
      name: `Webhook для видео #${videoId}`,
      is_active: true,
      target_type: 'video',
      target_id: videoId,
      triggers: [
        {
          event_type: eventType,
          threshold_value: 0,
          is_active: true,
        },
      ],
    };
    return this.createWebhook(webhookData);
  };

  createChannelWebhook = async (
    channelId: number,
    url: string,
    eventType: WebhookEventType = 'subscribe'
  ): Promise<SWebhookInfoResponse> => {
    if (eventType !== 'subscribe') {
      throw new Error("Метод createChannelWebhook предназначен только для триггера 'subscribe'");
    }
    
    const webhookData: SWebhookCreateRequest = {
      url: url,
      name: `Webhook для канала #${channelId}`,
      is_active: true,
      target_type: 'channel',
      target_id: channelId,
      triggers: [
        {
          event_type: eventType,
          threshold_value: 0,
          is_active: true,
        },
      ],
    };
    return this.createWebhook(webhookData);
  };
}

export const webhookApi = new WebhookApi(); 
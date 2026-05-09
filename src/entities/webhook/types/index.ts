export type WebhookTargetType = 'channel' | 'all_videos' | 'video';

export type WebhookEventType = 'view_start' | 'view_percentage' | 'view_duration' | 'purchase' | 'comment' | 'like' | 'subscribe';

export interface SWebhookTrigger {
  event_type: WebhookEventType;
  threshold_value: number;
  is_active: boolean;
  id?: number;
  webhook_id?: number;
}

export interface SWebhookCreateRequest {
  url: string;
  name: string;
  is_active: boolean;
  target_type: WebhookTargetType;
  target_id?: number;
  auth_token?: string;
  triggers: SWebhookTrigger[];
}

export interface SWebhookInfo {
  id: number;
  name: string;
  url: string;
  is_active: boolean;
  target_type: WebhookTargetType;
  target_id: number | null;
  auth_token: string | null;
  triggers: SWebhookTrigger[];
  created_at: string;
  updated_at: string;
  user_id?: number;
}

export interface WebhookListResponse {
  total: number;
  offset: number;
  limit: number;
  count: number;
  filter: string;
  items: SWebhookInfo[];
}

export type SWebhookInfoResponse = SWebhookInfo; 
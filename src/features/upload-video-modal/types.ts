export interface ITimeNo {
  reg: number;
  pay: number;
}

export type WebhookTriggerType = 'view_start' | 'comment';

export interface ISubmitData {
  title: string;
  description: string;
  metadata_ai_description: string;
  tags: string[];
  categories: string[];
  timeNo: ITimeNo;
  isVertical: boolean;
  isFreeVideo: boolean;
  isAllowRewind: boolean;
  videoId: number | null;
  preview_image: string;
  playlistId: number | null;
  videoType: 'public' | 'private' | 'link';
  isPremium: boolean;
  webhookUrl: string;
  webhookTrigger: WebhookTriggerType;
} 
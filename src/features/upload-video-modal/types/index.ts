export interface IVideoSettings {
  isVertical: boolean;
  isAllowRewind: boolean;
  isPaidVideo: boolean;
}

export interface ITimeNo {
  reg: number;
  pay: number;
}

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
}

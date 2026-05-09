export interface Session {
  id: string;
  lifetime_minutes: number;
  auth?: boolean;
  created_at?: string;
  expires_at?: string;
  refresh_token?: string;
  tg_id?: number;
}

export type LoginBotProvider = 'telegram' | 'max';

export interface LoginBotUrls {
  telegram: string;
  max: string | null;
}

export interface CurrentUser {
  user_id: number;
  user_name: string;
  user_avatar: string;
}

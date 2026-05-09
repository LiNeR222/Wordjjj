import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';
import { LoginBotUrls, Session } from '../types';

const SERVICE_URL = `${apiUrl}/auth/sessions`;

export class SessionsApi extends BaseApi {
  createSession = async (videoId?: string): Promise<Session> => {
    console.log('[SessionsApi] Creating session with videoId:', videoId || 'none');
    const params = videoId ? { videoId } : undefined;
    return this.publicApi.get(`${SERVICE_URL}/new`, { params });
  };
  getBotUrl = async (): Promise<string> => this.publicApi.get(`${apiUrl}/bot_url`);
  getBotUrls = async (): Promise<LoginBotUrls> => this.publicApi.get(`${apiUrl}/bot_urls`);
  getSession = async (sessionId: string): Promise<Session> => this.publicApi.get(`${SERVICE_URL}/session/${sessionId}`);
  updateSessionLifeTime = async (sessionId: string): Promise<Session> =>
    this.publicApi.post(`${SERVICE_URL}/session/update-life-time/${sessionId}`);
  deleteSession = async (sessionId: string): Promise<void> =>
    this.publicApi.delete(`${SERVICE_URL}/session/${sessionId}`);
}

export const sessionsApi = new SessionsApi();

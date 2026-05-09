import { BaseApi } from '@/shared/api/baseApi';
import { SaveTokenResponse } from '../types';

const SERVICE_URL = '/api';

export class TokenApi extends BaseApi {
  getUserIdTokenBelongsTo = async (): Promise<number> => this.privateApi.post(`${SERVICE_URL}/token/check`);
  refreshAccessToken = async (): Promise<SaveTokenResponse> =>
    this.privateApi.get(`${SERVICE_URL}/token`);
  saveRefreshToken = async (refreshToken: string): Promise<void> =>
    this.publicApi.post(`${SERVICE_URL}/token`, { refresh_token: refreshToken });
  clearRefreshToken = async (): Promise<void> =>
    this.publicApi.delete(`${SERVICE_URL}/token`);
}

export const tokenApi = new TokenApi();

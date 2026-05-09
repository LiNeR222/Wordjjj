import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';
import type { UserResponse, UserSearchResponse } from '../types';

const SERVICE_URL = `${apiUrl}/users`;

export class UserApi extends BaseApi {
  getMyProfile = async (): Promise<UserResponse> => await this.privateApi.get(`${SERVICE_URL}/my`);
  updateUsername = async (name: string): Promise<void> => await this.privateApi.put(`${SERVICE_URL}/my`, { name });
  getUserAvatar = async (userId: number): Promise<string> =>
    await this.publicApi.get(`${SERVICE_URL}/${userId}/avatar`);
  uploadMyAvatar = async (file: FormData): Promise<UserResponse> =>
    await this.privateApi.put(`${SERVICE_URL}/my/avatar`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
        accept: 'application/json',
      },
    });
  removeMyAvatar = async (): Promise<UserResponse> =>
    await this.privateApi.delete(`${SERVICE_URL}/my/avatar`);

  searchUsers = async (q: string, limit = 20): Promise<UserSearchResponse> =>
    await this.privateApi.get(`${SERVICE_URL}/search`, {
      params: { q, limit },
      cache: { ttl: 0 },
    });
}

export const userApi = new UserApi();

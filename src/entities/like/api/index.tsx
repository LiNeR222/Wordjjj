import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';
import type { PutLikeResponse, VideoLikes } from '../types';

const SERVICE_URL = `${apiUrl}/likes`;

export class LikeApi extends BaseApi {
  getPublicLikes = async (videoId: number): Promise<VideoLikes> =>
    await this.publicApi.get(`${SERVICE_URL}/like/${videoId}`);
  getLikes = async (videoId: number): Promise<VideoLikes> =>
    await this.privateApi.get(`${SERVICE_URL}/like/${videoId}`);
  putLike = async ({ status, videoId }: PutLikeResponse): Promise<VideoLikes> =>
    await this.privateApi.put(`${SERVICE_URL}/like/${videoId}`, null, { params: { status } });
}

export const likeApi = new LikeApi();

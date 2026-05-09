import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';
import type { CommentCreate, CommentGetResponse, SearchParams, VideoComment } from '../types';

const SERVICE_URL = `${apiUrl}/comments`;

export class CommentApi extends BaseApi {
  getComment = async (commentId: number): Promise<VideoComment> =>
    await this.publicApi.get(`${SERVICE_URL}/comment/${commentId}`);
  getComments = async (videoId: number, params?: SearchParams): Promise<CommentGetResponse> =>
    await this.publicApi.get(`${SERVICE_URL}/${videoId}`, params && { params });
  editComment = async (commentId: number, message: string): Promise<VideoComment> =>
    await this.privateApi.patch(`${SERVICE_URL}/${commentId}`, null, { params: { message } });
  createComment = async (videoId: number, comment: CommentCreate): Promise<VideoComment> =>
    await this.privateApi.post(`${SERVICE_URL}/comment/new`, comment);
  deleteComment = async (commentId: number): Promise<VideoComment> =>
    await this.privateApi.delete(`${SERVICE_URL}/${commentId}`);
}

export const commentApi = new CommentApi();

import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl } from '@/shared/config';
import { SPlaylistCreateRequest, SPlaylistInfoResponse, SPlaylistListResponse, SPlaylistVideoRequest } from '../types';

const SERVICE_URL = `${apiUrl}/playlists`;

export class PlaylistApi extends BaseApi {
  getUserPlaylists = async (offset: number = 0, limit: number = 10): Promise<SPlaylistListResponse> =>
    this.privateApi.get(`${SERVICE_URL}/my`, { params: { offset, limit } });

  createPlaylist = async (data: SPlaylistCreateRequest): Promise<SPlaylistInfoResponse> =>
    this.privateApi.post(`${SERVICE_URL}`, data);

  addVideosToPlaylist = async (playlistId: number, data: SPlaylistVideoRequest): Promise<SPlaylistInfoResponse> =>
    this.privateApi.post(`${SERVICE_URL}/${playlistId}/videos`, data);

  removeVideosFromPlaylist = async (playlistId: number, data: SPlaylistVideoRequest): Promise<SPlaylistInfoResponse> =>
    this.privateApi.delete(`${SERVICE_URL}/${playlistId}/videos`, { data });
}

export const playlistApi = new PlaylistApi(); 
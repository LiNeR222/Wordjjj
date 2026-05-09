import { BaseApi } from '@/shared/api/baseApi';
import { apiUrl, isServer } from '@/shared/config';
import { SUGGESTIONS_LIMIT } from '../config';
import { myVideoPerPage, videoPerPage } from '../model/constants';
import type {
  ICreateVideoData,
  MyVideoList,
  VideoMediaContentType,
  VideoUploadAbortResponse,
  VideoUploadCompletePart,
  VideoUploadCompleteResponse,
  VideoUploadInitResponse,
  VideoUploadPartUrlsResponse,
  VideoUploadStatusResponse,
  Recommendations,
  Statistics,
  Suggestions,
  Video,
  VideoDetailed,
  VideoProcessingStatus,
  VideoRecommendationsQuery,
  PlaylistVideos,
  PlaylistInfo,
  VideoSubscription,
} from '../types';

const SERVICE_URL = `${apiUrl}/videos`;

export class VideoApi extends BaseApi {
  getDetailedVideo = async (id: number): Promise<VideoDetailed> =>
    this.publicApi.get(`${SERVICE_URL}/video/${id}`, { params: { detail: true } });

  getVideos = async (page: number = 1): Promise<Video[]> =>
    this.privateApi.get(`${SERVICE_URL}/?offset=${(page - 1) * videoPerPage}&limit=${videoPerPage}`);

  getMyVideos = async (page: number = 1): Promise<MyVideoList> =>
    this.privateApi.get(`${SERVICE_URL}/my?offset=${(page - 1) * myVideoPerPage}&limit=${myVideoPerPage}`);

  getRecommendations = async (data: VideoRecommendationsQuery): Promise<Recommendations> =>
    this.publicApi.get(`${SERVICE_URL}/recommendations`, { params: data });

  getMyStatistics = async (): Promise<Statistics> => this.privateApi.get(`${SERVICE_URL}/statistics`);

  checkVideo = async (id: number): Promise<void> =>
    this.publicApi.get(`${SERVICE_URL}/video/${id}`, { params: { check: true } });

  createVideo = async (data: ICreateVideoData): Promise<VideoDetailed> =>
    this.privateApi.post(`${SERVICE_URL}/video/new_video`, data);

  initVideoUpload = async (
    file: File,
    mediaContentType: VideoMediaContentType = 'VIDEO',
  ): Promise<VideoUploadInitResponse> =>
    this.privateApi.post(`${SERVICE_URL}/upload/init`, {
      file_name: file.name,
      file_size: file.size,
      content_type_header: file.type || null,
      media_content_type: mediaContentType,
    });

  getVideoUploadPartUrls = async (
    videoId: number,
    partNumbers: number[],
  ): Promise<VideoUploadPartUrlsResponse> =>
    this.privateApi.post(`${SERVICE_URL}/upload/multipart/part-urls`, {
      video_id: videoId,
      part_numbers: partNumbers,
    });

  completeVideoUpload = async (
    videoId: number,
    parts?: VideoUploadCompletePart[],
  ): Promise<VideoUploadCompleteResponse> =>
    this.privateApi.post(`${SERVICE_URL}/upload/complete`, {
      video_id: videoId,
      ...(parts ? { parts } : {}),
    });

  abortVideoUpload = async (videoId: number): Promise<VideoUploadAbortResponse> =>
    this.privateApi.post(`${SERVICE_URL}/upload/abort`, {
      video_id: videoId,
    });

  getVideoUploadStatus = async (videoId: number): Promise<VideoUploadStatusResponse> =>
    this.privateApi.get(`${SERVICE_URL}/upload/${videoId}/status`);

  uploadVideo = async (file: FormData): Promise<Video> =>
    await this.privateApi.post(`${SERVICE_URL}/upload`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
        accept: 'application/json',
      },
    });

  uploadPreview = async (videoId: number, file: FormData): Promise<Video> =>
    await this.privateApi.post(`${SERVICE_URL}/video/${videoId}/preview_image/upload`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
        accept: 'application/json',
      },
    });

  getPlaylist = async (): Promise<Video[]> => this.privateApi.get(`${SERVICE_URL}`);

  getPlaylistInfo = async (playlistId: number): Promise<PlaylistInfo> =>
    this.publicApi.get(`${apiUrl}/playlists/${playlistId}`, { cache: { ttl: 0 } });

  getPlaylistVideos = async (playlistId: number): Promise<PlaylistVideos> =>
    this.publicApi.get(`${apiUrl}/playlists/${playlistId}/videos`, { cache: { ttl: 0 } });

  getSuggestions = async (q: string): Promise<Suggestions> =>
    this.publicApi.get(`${SERVICE_URL}/suggestions`, { params: { q, limit: SUGGESTIONS_LIMIT } });

  /**
   * Получает текущий статус обработки видео
   * @param videoId ID видео
   * @returns Статус обработки видео
   */
  getVideoProcessingStatus = async (videoId: number): Promise<VideoProcessingStatus> =>
    this.privateApi.get(`${SERVICE_URL}/video/${videoId}/status`);

  /**
   * Получает токен для подписки на обновления статуса обработки видео
   * @param videoId ID видео
   * @returns Данные для подписки на обновления
   */
  subscribeToVideoUpdates = async (videoId: number): Promise<VideoSubscription> =>
    this.privateApi.get(`${SERVICE_URL}/video/${videoId}/subscribe`);

  deleteVideo = async (id: number) => this.privateApi.delete(`${SERVICE_URL}/video_delete/${id}`);
}

export const videoApi = isServer ? ({} as VideoApi) : new VideoApi();

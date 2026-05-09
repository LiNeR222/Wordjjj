export interface Video {
  video_id: number;
  title: string;
  preview_image: string | null;
  channel_id: number;
  channel_name: string;
  channel_avatar: string;
  playlist_id: number;
  numbers_views: number;
  duration_sec: number;
  free: boolean;
  vertical: boolean;
  seo_url: string;
  date_publication: string;
  draft: boolean;
}

export interface MyVideo extends Video {
  format_video: string;
  cost_video: number;
  file_size: number;
  referrals: number;
}

export interface MyVideoList {
  total: number;
  offset: number;
  limit: number;
  count: number;
  filter: {
    user_id: number;
  };
  items: MyVideo[];
}

export type VideoCategory = 'video' | 'audio' | 'shorts';

export interface IRecommendationsReq {
  offset: number;
  limit: number;
  video_id: number | null;
  category: VideoCategory | null;
}

export interface Recommendations {
  count: number;
  total: number;
  limit: number;
  offset: number;
  filter: {
    category: VideoCategory | null;
    video_id: number;
  };
  items: Video[];
}

export interface VideoDetailed extends Omit<Video, 'channel_name' | 'channel_avatar'> {
  time_not_reg: number | null;
  time_not_pay: number | null;
  permission_rewind: boolean;
  description: string;
  metadata_subtitles: string;
  metadata_ai_description: string;
  tags?: string[];
  categories?: string[];
  bought?: boolean;
  format_video: 'public' | 'private' | 'link';
  user_hash: string;
  product_id: number | null;
}

export interface VideoCreate extends VideoDetailed {
  tags?: string[];
  category?: string[];
}

export interface Statistics {
  views: number;
  views_per: number;
  registrations_referrals: number;
  registrations_utm: number;
  registrations_per: number;
  disk_usage: number;
  disk_usage_per: number;
  cost: number;
  cost_per: number;
  period: string;
}

export interface ICreateVideoData {
  video_id: number;
  title: string;
  description: string;
  channel_id: number;
  playlist_id: number | null;
  free: boolean;
  vertical: boolean;
  permission_rewind: boolean;
  time_not_reg: number;
  time_not_pay: number;
  format_video: 'public' | 'private' | 'link';
  date_publication: Date;
  metadata_subtitles: '';
  metadata_ai_description: string;
  tags: string[];
  categories: string[];
  productId: number | null;
  advertisement: boolean;
  erid_text: string | null;
}

export interface VideoRecommendationsQuery {
  /**
   * Поисковый запрос для фильтрации видео по заголовку и описанию.
   */
  q?: string;

  /**
   * Смещение для пагинации результатов.
   */
  offset?: number;

  /**
   * Максимальное количество возвращаемых видео (от 1 до 100).
   */
  limit?: number;

  /**
   * ID видео, на основе которого будут формироваться рекомендации
   * (использует теги и категории).
   */
  video_id?: number;

  /**
   * Фильтрация по типу контента.
   */
  category?: VideoCategory;

  /**
   * Фильтрация видео по конкретному каналу.
   */
  channel_id?: string;

  /**
   * Фильтрация видео по конкретному владельцу.
   */
  user_id?: number;

  /**
   * Фильтрация по платности.
   * - true: только бесплатные видео.
   * - false: только платные видео.
   */
  is_free?: boolean;

  /**
   * Фильтрация по требованию авторизации.
   * - true: только для авторизованных пользователей.
   * - false: доступные всем.
   */
  auth_required?: boolean;

  /**
   * Период времени для фильтрации.
   */
  date_period?: 'day' | 'week' | 'month' | 'year' | 'all';

  /**
   * Тип даты для фильтрации.
   * - created: дата создания.
   * - updated: дата обновления.
   */
  date_filter_type?: 'created' | 'updated';

  /**
   * Поле для сортировки результатов.
   */
  sort_by?: string;

  /**
   * Порядок сортировки.
   * - asc: по возрастанию.
   * - desc: по убыванию.
   */
  sort_order?: 'asc' | 'desc';

  /**
   * Данные текущего пользователя (необязательно).
   */
  current_user?: unknown;
}

export type VideoRecommendationsKey = keyof VideoRecommendationsQuery;

export const videoRecommendationsKeys: VideoRecommendationsKey[] = [
  'q',
  'offset',
  'limit',
  'video_id',
  'channel_id',
  'user_id',
  'is_free',
  'auth_required',
  'date_period',
  'sort_by',
  'sort_order',
  'current_user',
];

export type RecommendationsSearchParams = {
  q?: VideoRecommendationsQuery['q'];
  category?: VideoRecommendationsQuery['category'];
  is_free?: VideoRecommendationsQuery['is_free'];
  date_period?: VideoRecommendationsQuery['date_period'];
  sort_by?: VideoRecommendationsQuery['sort_by'];
};

export type Suggestions = {
  query: string;
  suggestions: string[];
  total: number;
  limit: number;
};

export interface VideoProcessingProgress {
  progress: number;
  status: string;
  stage: string;
  message: string;
}

export interface VideoProcessingStatus {
  video_id: number;
  progress: number;
  processing_status: string | null;
  moderation_status: string | null;
  is_draft: boolean;
  is_processing: boolean;
}

export interface VideoSubscription {
  token: string;
  channel: string;
  expires_at: string;
}

export interface VideoProgressUpdate {
  video_id: number;
  progress: number;
  processing_status:
    | 'initializing'
    | 'downloading'
    | 'processing'
    | 'transcoding'
    | 'generating_subtitles'
    | 'finalizing'
    | 'completed'
    | 'failed'
    | 'error';
  processing_stage: string;
  processing_message?: string;
  moderation_status?: string;
  is_draft?: boolean;
  is_processing?: boolean;
  last_update?: string;
}

export type PlayerElement = HTMLVideoElement | HTMLVmPlayerElement | null;

export interface VideoInPlaylist {
  video_id: number;
  title: string;
  preview_image: string | null;
  post_image: string | null;
  channel_id: number;
  playlist_id: number | null;
  numbers_views: number;
  duration_sec: number;
  free: boolean;
  vertical: boolean;
  seo_url: string;
  date_publication: string;
  format_video: string;
  draft: boolean;
  content_type: string;
  latitude: number | null;
  longitude: number | null;
  location_text: string | null;
  has_access: boolean | null;
}

export interface PlaylistItem {
  order: number;
  video: VideoInPlaylist;
}

export interface PlaylistInfo {
  id: number;
  channel_id: number;
  format: 'private' | 'link' | 'public';
  free: boolean;
  permission_skip: boolean;
  title: string;
  description: string;
  date_publication: string;
  videos_count: number;
}

export interface PlaylistVideos {
  total: number;
  offset: number;
  limit: number;
  count: number;
  playlist_id: number;
  items: PlaylistItem[];
}

export type VideoUploadMethod = 'single' | 'multipart';
export type VideoUploadStatus = 'pending_upload' | 'uploaded' | 'failed';
export type VideoMediaContentType = 'VIDEO' | 'PHOTO';

export interface VideoUploadInitResponse {
  video_id: number;
  upload_method: VideoUploadMethod;
  upload_url: string | null;
  expires_at: string;
  method: 'PUT';
  content_type: VideoMediaContentType;
  multipart_upload_id: string | null;
  part_size: number | null;
  total_parts: number | null;
}

export interface VideoUploadPartUrl {
  part_number: number;
  upload_url: string;
  expires_at: string;
  method: 'PUT';
}

export interface VideoUploadPartUrlsResponse {
  video_id: number;
  multipart_upload_id: string;
  parts: VideoUploadPartUrl[];
}

export interface VideoUploadCompletePart {
  part_number: number;
  etag: string;
}

export interface VideoUploadCompleteResponse {
  video_id: number;
  upload_status: VideoUploadStatus;
  content_type: VideoMediaContentType;
  message: string;
}

export interface VideoUploadAbortResponse {
  video_id: number;
  upload_status: VideoUploadStatus;
}

export interface VideoUploadStatusResponse {
  video_id: number;
  upload_status: VideoUploadStatus | null;
  content_type: VideoMediaContentType;
  upload_method: VideoUploadMethod | null;
  multipart_upload_id: string | null;
  last_status_update_at: string | null;
  uploaded_at: string | null;
}

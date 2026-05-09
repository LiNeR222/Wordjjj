export type PlaylistFormat = 'private' | 'link' | 'public';

export interface SPlaylistInfo {
  id: number;
  channel_id: number;
  title: string;
  description: string;
  format: PlaylistFormat;
  free: boolean;
  permission_skip: boolean;
  date_publication: string;
  video_count: number;
  views_count: number;
  purchase_count: number;
  created_at: string;
  updated_at: string;
}

export interface SPlaylistCreateRequest {
  channel_id: number;
  title: string;
  description: string;
  format: PlaylistFormat;
  free?: boolean;
  permission_skip?: boolean;
  date_publication?: string;
  video_ids?: number[];
}

export interface SPlaylistVideoRequest {
  video_ids: number[];
}

export interface SPlaylistInfoResponse extends SPlaylistInfo {
  videos: number[];
}

export interface SPlaylistListResponse {
  total: number;
  offset: number;
  limit: number;
  count: number;
  items: SPlaylistInfo[];
} 
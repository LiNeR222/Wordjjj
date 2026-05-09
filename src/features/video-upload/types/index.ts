export interface FormValues {
  video_id: number | null;
  title: string;
  description: string;
  metadata_ai_description: string;
  tags: string[];
  categories: string[];
  time_not_reg: number | null;
  time_not_pay: number | null;
  free: boolean;
  vertical: boolean;
  permission_rewind: boolean;
  //preview_image: string;
  channel_id: number;
  playlist_id?: number;
  format_video: 'public' | 'private' | 'link';
  product_id: number | null;
  metadata_subtitles: string;
  date_publication: string;
  publicity_expiration: string | null;
  lifetime_expiration: string | null;
  advertisement: boolean;
  erid_text: string | null;
}

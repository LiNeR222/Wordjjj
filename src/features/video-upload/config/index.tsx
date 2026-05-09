import { FormValues } from '../types';

export const defaultValues: FormValues = {
  video_id: null,
  title: '',
  description: '',
  metadata_ai_description: '',
  tags: [],
  categories: [],
  time_not_reg: null,
  time_not_pay: null,
  vertical: false,
  free: true,
  permission_rewind: false,
  format_video: 'public',
  //preview_image: '',
  channel_id: 1,
  product_id: null,
  date_publication: new Date().toISOString(),
  metadata_subtitles: '',
  publicity_expiration: null,
  lifetime_expiration: null,
  advertisement: false,
  erid_text: null
};

import { NextResponse } from 'next/server';

const data = [
  {
    video_id: 39,
    title: 'фываывафыва',
    preview_image: 'https://interesnoitochka.ru/api/v1/videos/video/39/preview_image',
    channel_id: 1,
    playlist_id: null,
    numbers_views: 0,
    duration_sec: 200,
    free: true,
    vertical: true,
    seo_url: 'seo_url',
    date_publication: '2025-02-25T21:17:41.805000',
    format_video: 'public',
    cost_video: 0,
    file_size: 0,
  },
  {
    video_id: 40,
    title: 'Новое видео',
    preview_image: 'img',
    channel_id: 1,
    playlist_id: null,
    numbers_views: 0,
    duration_sec: 0,
    free: true,
    vertical: false,
    seo_url: 'seo_url',
    date_publication: '2025-02-25T18:05:10.546284',
    format_video: 'public',
    cost_video: 0,
    file_size: 0,
  },
  {
    video_id: 41,
    title: 'Your Name Edit [Kimi no Na wa AMV] - Runaway (AURORA)',
    preview_image: 'https://interesnoitochka.ru/api/v1/videos/video/41/preview_image',
    channel_id: 1,
    playlist_id: null,
    numbers_views: 0,
    duration_sec: 200,
    free: true,
    vertical: false,
    seo_url: 'seo_url',
    date_publication: '2025-02-24T05:16:23.161000',
    format_video: 'private',
    cost_video: 0,
    file_size: 0,
  },
];

export async function GET() {
  return NextResponse.json(data);
}

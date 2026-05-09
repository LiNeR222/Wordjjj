import { NextResponse } from 'next/server';

const data = {
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
  time_not_reg: 10,
  time_not_pay: 60,
  permission_rewind: true,
  description:
    'AA STORY BY NATHANIEL MURPHY, JEREMY HIGGINS & JENNY LUCIA MASCIA DIRECTED BY JENNY LUCIA MASCIA, A STORY BY NATHANIEL MURPHY, JEREMY HIGGINS & JENNY LUCIA MASCIA DIRECTED BY JENNY LUCIA MASCIA',
  tags: [
    '1',
    'Life',
    'Khruangbin',
    'Music Video',
    'Mixed-Media',
    'Experimental Animation',
    'Short Film',
    'Film',
    'Animation',
  ],
  categories: ['2', 'Base', '2025', 'Music'],
  metadata_subtitles: 'metadata subtitles',
  metadata_ai_description: 'metadata ai description',
};

export async function GET() {
  return NextResponse.json(data);
}

'use client';

import { SwiperList } from '@/features/short-videos/ui/swiper-list';
import { SwiperModal } from '@/features/short-videos/ui/swiper-modal';

export default function FeedPage({ params }: { params: { slug?: string[] } }) {
  const id = Number(params.slug?.[0]);

  return (
    <SwiperModal>
      <SwiperList currentVideoId={id} />
    </SwiperModal>
  );
}

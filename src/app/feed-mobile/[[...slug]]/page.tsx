import { SwiperList } from '@/features/short-videos/ui/swiper-list';

export default function FeedPage({ params }: { params: { slug?: string[] } }) {
  const id = params.slug?.[0];

  return (
    <div className='w-full h-full bg-black sm:bg-inherit '>
      <SwiperList currentVideoId={Number(id)} />
    </div>
  );
}

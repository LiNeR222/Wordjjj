import { RecommendationsSearchParams } from '@/entities/video/types';
import { VideoRecommendations } from '@/features/video-recommendations';
import { FaFire } from 'react-icons/fa';

export default function VideosInfinityList({ searchParams }: { searchParams: RecommendationsSearchParams }) {
  const category = searchParams.category || 'all';

  if (category !== 'all' && category !== 'video') {
    return null;
  }

  return (
    <section className='space-y-6'>
      <div className='flex w-full h-full flex-col'>
        {category === 'video' && (
          <p className='text-2xl font-semibold flex items-center gap-2 mb-5'>
            Рекомендации <FaFire color='#ff9a00' />
          </p>
        )}

        <VideoRecommendations offset={category === 'video' ? 0 : 10} {...searchParams} />
      </div>
    </section>
  );
}

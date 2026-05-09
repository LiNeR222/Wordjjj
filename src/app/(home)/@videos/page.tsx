import { fetchVideoRecommendations } from '@/entities/video/api/server';
import { RecommendationsSearchParams } from '@/entities/video/types';
import { VideoRecommendationsLimitedList, videosPerPage } from '@/features/video-recommendations';
import { FaFire } from 'react-icons/fa';

export default async function Videos({ searchParams }: { searchParams: RecommendationsSearchParams }) {
  const category = searchParams.category || 'all';

  if (category !== 'all') {
    return null;
  }

  const { data } = await fetchVideoRecommendations({
    limit: videosPerPage,
    category: 'video',
    ...searchParams,
  });
  return (
    <section className='space-y-6'>
      <div className='flex w-full h-full flex-col'>
        <p className='text-2xl font-semibold flex items-center gap-2 mb-5'>
          Рекомендации <FaFire color='#ff9a00' />
        </p>
        <VideoRecommendationsLimitedList initialData={data} />
      </div>
    </section>
  );
}

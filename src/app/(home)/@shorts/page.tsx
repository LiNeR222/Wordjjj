import { fetchVideoRecommendations } from '@/entities/video/api/server';
import { RecommendationsSearchParams } from '@/entities/video/types';
import { shortsPerPage, ShortVideoList } from '@/features/short-videos';

export default async function Shorts({ searchParams }: { searchParams: RecommendationsSearchParams }) {
  const category = searchParams.category || 'all';
  if (category !== 'all' && category !== 'shorts') {
    return null;
  }

  const { data } = await fetchVideoRecommendations({
    limit: shortsPerPage,
    category: 'shorts',
    ...searchParams,
  });

  return <ShortVideoList vertical={searchParams.category === 'shorts'} {...(data && { initialData: data })} />;
}

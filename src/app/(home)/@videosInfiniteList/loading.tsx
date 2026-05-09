import { VideoRecommendationsSkeleton } from '@/entities/video';

export default function Loading() {
  return (
    <section className='space-y-6'>
      <VideoRecommendationsSkeleton vertical={true} category='videos' />
    </section>
  );
}

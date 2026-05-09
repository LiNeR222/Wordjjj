import { VideoRecommendationsSkeleton } from '@/entities/video';

export default function Loading() {
  return (
    <section className='space-y-6'>
      <VideoRecommendationsSkeleton vertical={false} category='shorts' />
    </section>
  );
}

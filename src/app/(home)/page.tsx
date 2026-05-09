import { RecommendationsSearchParams } from '@/entities/video/types';
import { Banner } from '@/widgets/banner';
import { VideosHeader } from '@/widgets/videos-header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Интересно и точка',
  description: 'Смотрите интересные видео и узнавайте что-то новое каждый день',
  openGraph: {
    title: 'Интересно и точка - видеоплатформа',
    description: 'Смотрите интересные видео и узнавайте что-то новое каждый день',
  },
};

interface PageProps {
  searchParams: RecommendationsSearchParams;
}

export default function Home({ searchParams }: PageProps) {
  return (
    <>
      <VideosHeader {...searchParams} />
      <section className='relative mx-0 sm:-mx-6 overflow-hidden'>
        <Banner category={searchParams.category} hasSearchQuery={Boolean(searchParams.q)} />
      </section>
    </>
  );
}

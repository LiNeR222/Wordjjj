import { StatsBoard } from '@/widgets/my-statistic/ui/stats-board';
import { MyVideos } from '@/widgets/my-videos';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Мои видео | Интересно и точка',
  description: 'Управление вашими видео и статистикой',
  openGraph: {
    title: 'Мои видео | Интересно и точка',
    description: 'Управление видео и статистикой на платформе',
  },
};

export default function MyVideosPage({ searchParams }: { searchParams: { page: string } }) {
  const page = searchParams.page ?? '1';

  return (
    <main className='min-h-full max-w-full md:max-w-[calc(100%-48px)]  w-full ml-0 md:ml-12 flex flex-col items-center'>
      <div className='w-full max-w-[1350px] max-[640px]:px-2 p-[30px] space-y-[30px]'>
        <h1 className='text-2xl font-semibold m-0 tracking-tight'>Мое видео</h1>
        <section className='w-full'>
          <Suspense fallback={<div>Загрузка...</div>}>
            <StatsBoard />
          </Suspense>
        </section>
        <section className='w-full pt-[30px]'>
          <Suspense fallback={<div>Загрузка...</div>}>
            <MyVideos page={Number(page)} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

'use client';

// import { Button } from '@/shared/ui';
import { videoHeaderStore } from '@/widgets/videos-header/model/video-header-store';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';

const posterUrl =
  'https://i.vimeocdn.com/video/1963574657-631176f0ffd56c75a37e9e4d36aadde1f68be7802ca7fc252fe3e028d6ed558b-d_960x540?r=pad';

export const Banner = observer(({ category, hasSearchQuery }: { category?: string; hasSearchQuery?: boolean }) => {
  const { isSearchActive } = videoHeaderStore;

  if (category !== undefined && category !== 'all') {
    return null;
  }

  const isVisible = !isSearchActive && !hasSearchQuery;

  return (
    <>
      <Head>
        <link rel='preload' href={posterUrl} as='image' type='image/jpeg' />
      </Head>
      {/* next/image вызывает мерцание при перезагрузке страницы */}
      {/*eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={clsx('w-full object-cover object-top transition-all duration-700 max-w-full', isVisible ? 'h-[400px]' : 'h-0')}
        height={400}
        width={1600}
        src={posterUrl}
        alt='poster'
        fetchPriority='high'
      />
      <div
        className={clsx(
          'absolute top-0 gap-y-4 z-10 px-6 pt-12 text-white transition-all duration-400',
          isVisible ? 'delay-300 opacity-100' : 'opacity-0 delay-300'
        )}>
        <h1 className='font-semibold text-2xl tracking-tight'>
          Смотрите полезные и увлекательные ролики. <br /> Одна платформа для всего контента.
        </h1>
        {/* <Button variant='default' className='!border-white mt-[24px]'>
          Месяц бесплатно
        </Button> */}
      </div>
    </>
  );
});

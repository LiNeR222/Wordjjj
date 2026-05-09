'use client';

import { VideoCardMemo } from '@/entities/video';
import { Recommendations } from '@/entities/video/types';
import { useUpdateRecommendationsQuery } from '@/shared/lib/use-update-recommendations-query';
import { observer } from 'mobx-react-lite';
import { FC, forwardRef, useEffect } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { videosPerPage } from '../config';
import { recommendationsVideoStore } from '../model';

export interface IVideoRecommendations {
  offset?: number;
  initialData?: Recommendations;
}

interface ListProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const gridComponents = {
  List: forwardRef<HTMLDivElement, ListProps>(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )),
};

gridComponents.List.displayName = 'VideoItem';

export const VideoRecommendations: FC<IVideoRecommendations> = observer(({ offset = 0, initialData }) => {
  const { initialized, items, loadMore, hasMore } = recommendationsVideoStore;
  //TODO: найти решение без slice
  const videos = offset ? items.slice(offset) : items;


  useEffect(() => {
    if (initialData) {
      recommendationsVideoStore.initialize(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialized) return;
    //загрузка видео больше чем offset, так как видео до offset не будут отображаться
    loadMore(offset + videosPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, offset]);

  //обновить рекомендации в соответствии с searchParams
  useUpdateRecommendationsQuery(recommendationsVideoStore);

  return (
    <section className='space-y-6'>
      <div className='flex w-full h-full flex-col'>
        <VirtuosoGrid
          useWindowScroll
          totalCount={videos.length}
          data={videos}
          overscan={videosPerPage}
          listClassName='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-1 gap-y-3 row-auto'
          components={gridComponents}
          itemContent={(index, video) => {
            if (!video) return null;
            return <VideoCardMemo key={index} {...video} />;
          }}
          endReached={() => hasMore && loadMore()}
        />

        {/* <style>{`html, body, #root { margin: 0; padding: 0 }`}</style> */}
      </div>
    </section>
  );
});

'use client';

import { Recommendations } from '@/entities/video/types';
import { VideoCardMemo } from '@/entities/video';
import { useUpdateRecommendationsQuery } from '@/shared/lib/use-update-recommendations-query';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { recommendationsVideoStore } from '../model';

interface VideoRecommendationsLimitedListProps {
  initialData?: Recommendations;
  limit?: number;
}

export const VideoRecommendationsLimitedList: FC<VideoRecommendationsLimitedListProps> = observer(
  ({ initialData, limit = 10 }: VideoRecommendationsLimitedListProps) => {
    const { items, initialized } = recommendationsVideoStore;
    const videos = (initialized ? items : initialData?.items || []).slice(0, limit);

    useEffect(() => {
      recommendationsVideoStore.initialize(initialData);
    }, [initialData]);

    useUpdateRecommendationsQuery(recommendationsVideoStore);

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-1 gap-y-3 row-auto'>
        {videos.map((video, index) => (
          <VideoCardMemo key={index} {...video} />
        ))}
      </div>
    );
  }
);

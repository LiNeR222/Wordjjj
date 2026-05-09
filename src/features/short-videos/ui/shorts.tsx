'use client';

import { Recommendations } from '@/entities/video/types';
import { useUpdateRecommendationsQuery } from '@/shared/lib/use-update-recommendations-query';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { SiYoutubeshorts } from 'react-icons/si';
import { recommendationsVideoStore } from '../model';
import { HorizontalList } from './horizontal-list';
import { VerticalList } from './vertical-list';

export interface ShortVideoListProps {
  vertical?: boolean;
  initialData?: Recommendations;
}

export const ShortVideoList: FC<ShortVideoListProps> = observer(({ vertical = false, initialData }) => {
  const { items, initialized } = recommendationsVideoStore;
  const shorts = initialized || !Array.isArray(initialData?.items) ? items : initialData?.items;

  useEffect(() => {
    recommendationsVideoStore.initialize(initialData);
  }, [initialData]);

  useUpdateRecommendationsQuery(recommendationsVideoStore);

  return (
    <section className='space-y-6 w-full'>
      <div className='flex flex-col h-full w-full'>
        <p className='text-2xl font-semibold flex items-center gap-2 mb-6'>
          Шортcы <SiYoutubeshorts color='#8ED2CC' />
        </p>

        {vertical ? <VerticalList shorts={shorts} /> : <HorizontalList shorts={shorts} />}
      </div>
    </section>
  );
});

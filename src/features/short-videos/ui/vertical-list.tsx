import { Video } from '@/entities/video/types';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { recommendationsVideoStore } from '../model';
import { useNavigateToFeed } from '../utils/use-navigate-to-feed';
import { ShortItem } from './short-item';

export interface VerticalListProps {
  shorts: Video[];
}

export const VerticalList: FC<VerticalListProps> = observer(({ shorts }) => {
  const { loadMore, hasMore } = recommendationsVideoStore;
  const { navigateToFeed } = useNavigateToFeed();

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <VirtuosoGrid
        style={{ width: '100%', height: '100%', minHeight: '560px' }}
        data={shorts}
        overscan={10}
        useWindowScroll
        listClassName='grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-2 gap-y-6'
        itemContent={(index, video) => (
          <div
            role='button'
            tabIndex={0}
            aria-label='К ленте шортс'
            key={video.video_id || index}
            className='w-full h-fit flex justify-center'
            onClick={() => navigateToFeed(video.video_id)}>
            <ShortItem {...video} isActive={false} />
          </div>
        )}
        endReached={() => hasMore && loadMore()}
      />
    </div>
  );
});

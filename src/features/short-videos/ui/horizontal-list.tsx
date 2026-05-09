import { Video } from '@/entities/video/types';
import { observer } from 'mobx-react-lite';
import { FC, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { recommendationsVideoStore } from '../model';
import { useDragScroll } from '../utils/use-drag-scroll';
import { useHandleMouseWheel } from '../utils/use-handle-mouse-wheel';
import { useNavigateToFeed } from '../utils/use-navigate-to-feed';
import { useSwipe } from '../utils/use-swipe';
import NavigationPanel from './navigation-panel';
import { ShortItem } from './short-item';

export interface HorizontalListProps {
  shorts: Video[];
}

export const HorizontalList: FC<HorizontalListProps> = observer(({ shorts }) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const { loadMore, hasMore } = recommendationsVideoStore;
  const { currentIndex, scrollTo } = useSwipe({ items: shorts, virtuosoRef });
  useHandleMouseWheel({ containerRef, scrollTo });
  const { navigateToFeed } = useNavigateToFeed();
  useDragScroll({ scrollerRef });

  return (
    <div className='relative' ref={containerRef}>
      <NavigationPanel
        containerRef={containerRef}
        scrollToNext={scrollTo.next}
        scrollToPrev={scrollTo.prev}
        currentIndex={currentIndex}
        totalItems={shorts.length}
      />
      <Virtuoso
        ref={virtuosoRef}
        scrollerRef={ref => {
          scrollerRef.current = ref as HTMLElement | null;
        }}
        style={{ width: '100%', height: '100%', minHeight: '560px' }}
        horizontalDirection
        overscan={5}
        followOutput='smooth'
        className='scrollbar-hide'
        data={shorts}
        itemContent={(index, video) => (
          <div
            role='button'
            tabIndex={0}
            aria-label='К ленте шортс'
            key={video.video_id || index}
            className='w-fit h-full pe-3 cursor-pointer'
            onClick={() => navigateToFeed(video.video_id)}>
            <ShortItem {...video} isActive={index === currentIndex} />
          </div>
        )}
        endReached={() => hasMore && loadMore()}
      />
    </div>
  );
});

'use client';
import { observer } from 'mobx-react-lite';
import { FC, RefObject, useEffect, useMemo, useRef, useCallback } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { shortsPerPage } from '../config';
import { recommendationsVideoStore } from '../model';
import { useHandleKeyboardNavigation } from '../utils/use-handle-keyboard';
import { useHandleMouseWheel } from '../utils/use-handle-mouse-wheel';
import { useHandleSwipe } from '../utils/use-handle-swipe';
import { useShortsHistory } from '../utils/use-shorts-history';
import { useSwipe } from '../utils/use-swipe';
import { SwiperItem } from './swiper-item';
import { SwiperPanel } from './swiper-panel';
import { videoAnalytics } from '../model/video-analytics';

export interface SwiperListProps {
  initialData?: never;
  currentVideoId?: number;
}

export const SwiperList: FC<SwiperListProps> = observer(({ currentVideoId }) => {
  const { items: shorts, loadMore, hasMore, instance } = recommendationsVideoStore;
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLElement | Window | null>(null);
  const lastViewedIndex = useRef<number | null>(null);
  const viewStartTime = useRef<number | null>(null);

  const currentVideoIndex = useMemo(
    () => shorts.findIndex(video => video.video_id === currentVideoId),
    [shorts, currentVideoId]
  );
  const isCurrentVideoFound = currentVideoIndex !== -1;

  const { currentIndex, scrollTo } = useSwipe({
    items: shorts,
    virtuosoRef,
    index: isCurrentVideoFound ? currentVideoIndex : 0,
  });

  useShortsHistory(shorts[currentIndex]?.video_id);
  useHandleSwipe(scrollerRef, scrollTo);
  useHandleKeyboardNavigation({ scrollTo });
  useHandleMouseWheel({ containerRef: scrollerRef as RefObject<HTMLDivElement>, scrollTo });

  const preloadAdjacent = useCallback((index: number) => {
    const next = shorts[index + 1];
    const prev = shorts[index - 1];
    const preload = (videoId: number) => {
      fetch(`/api/videos/video/${videoId}/hls/playlist.m3u8`, { method: 'HEAD', priority: 'low' }).catch(() => {});
    };
    if (next) preload(next.video_id);
    if (prev) preload(prev.video_id);
  }, [shorts]);

  useEffect(() => {
    if (!shorts.length) return;
    preloadAdjacent(currentIndex);
  }, [currentIndex, preloadAdjacent, shorts.length]);

  useEffect(() => {
    if (!instance) {
      loadMore(shortsPerPage, currentVideoId);
    }
  }, [currentVideoId, instance, loadMore]);

  useEffect(() => {
    if (lastViewedIndex.current !== currentIndex) {
      if (lastViewedIndex.current !== null && viewStartTime.current !== null) {
        const duration = Date.now() - viewStartTime.current;
        videoAnalytics.sendViewEvent(shorts[lastViewedIndex.current]?.video_id, duration);
      }
      lastViewedIndex.current = currentIndex;
      viewStartTime.current = Date.now();
    }
  }, [currentIndex, shorts]);

  if (!shorts.length) return null;

  return (
    <div className='h-screen relative m-auto w-fit' style={{ touchAction: 'pan-y' }}>
      <SwiperPanel scrollTo={scrollTo} videoId={shorts[currentIndex]?.video_id} />
      <Virtuoso
        ref={virtuosoRef}
        scrollerRef={ref => {
          scrollerRef.current = ref as HTMLElement | null;
          if (scrollerRef.current) {
            scrollerRef.current.style.touchAction = 'none';
          }
        }}
        initialTopMostItemIndex={isCurrentVideoFound ? currentVideoIndex : 0}
        className='h-screen w-[calc(100vh*(9/16))] max-w-[100vw] scrollbar-hide overflow-hidden'
        overscan={1}
        followOutput='smooth'
        data={shorts}
        itemContent={(index, video) => (
          <div key={video.video_id || index} className='p-0 h-screen sm:p-5 sm:h-[calc(100vh-40px)]'>
            <SwiperItem video={video} isActive={currentIndex === index} />
          </div>
        )}
        endReached={() => hasMore && loadMore(2)}
      />
    </div>
  );
});
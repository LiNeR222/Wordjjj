import { Video } from '@/entities/video/types';
import { useCallback, useState } from 'react';
import { VirtuosoHandle } from 'react-virtuoso';

interface UseHorizontalScrollProps {
  items: Video[];
  virtuosoRef: React.RefObject<VirtuosoHandle>;
  index?: number;
}

export const useSwipe = ({ items, virtuosoRef, index = 0 }: UseHorizontalScrollProps) => {
  const [currentIndex, setCurrentIndex] = useState(index);

  const scrollToIndex = useCallback(
    (nextIndex: number) => {
      if (!virtuosoRef.current) return;
      setCurrentIndex(nextIndex);

      virtuosoRef.current.scrollToIndex({
        index: nextIndex,
        behavior: 'smooth',
        align: 'start',
      });
    },
    [virtuosoRef]
  );

  const scrollToNext = () => scrollToIndex(Math.min(currentIndex + 1, items.length - 1));
  const scrollToPrev = () => scrollToIndex(Math.max(currentIndex - 1, 0));

  return { currentIndex, scrollTo: { next: scrollToNext, prev: scrollToPrev, index: scrollToIndex } };
};

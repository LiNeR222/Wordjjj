import { useIsMobile } from '@/shared/lib/use-is-mobile';
import { useEffect, useRef } from 'react';

export const useHandleSwipe = (
  scrollerRef: React.RefObject<HTMLElement | Window | null>,
  scrollTo: {
    next: () => void;
    prev: () => void;
  }
) => {
  const prevY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const isSwiping = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const scroller = scrollerRef.current as HTMLElement | null;
    if (!scroller) return;

    const threshold = isMobile ? 5 : 20;

    const handlePointerDown = (e: PointerEvent) => {
      prevY.current = e.clientY;
      isDragging.current = true;
      isSwiping.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (prevY.current === null) return;
      const currentY = e.clientY;
      const deltaY = prevY.current - currentY;
      if (Math.abs(deltaY) > threshold) {
        isSwiping.current = true;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (prevY.current === null) return;
      const currentY = e.clientY;
      const deltaY = prevY.current - currentY;
      if (Math.abs(deltaY) > threshold) {
        isSwiping.current = true;
        if (deltaY > 0) {
          scrollTo.next();
        } else {
          scrollTo.prev();
        }
      }
      prevY.current = null;
    };

    //desktop
    const handleClick = (e: Event) => {
      if (isSwiping.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    scroller.addEventListener('pointerdown', handlePointerDown);
    scroller.addEventListener('pointermove', handlePointerMove);
    scroller.addEventListener('pointerup', handlePointerUp);
    scroller.addEventListener('click', handleClick, true);

    return () => {
      scroller.removeEventListener('pointerdown', handlePointerDown);
      scroller.removeEventListener('pointermove', handlePointerMove);
      scroller.removeEventListener('pointerup', handlePointerUp);
      scroller.removeEventListener('click', handleClick, true);
    };
  }, [scrollTo, scrollerRef, isMobile, isSwiping]);
};

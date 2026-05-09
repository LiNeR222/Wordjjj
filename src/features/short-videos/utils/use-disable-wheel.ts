import { RefObject, useEffect } from 'react';

interface UseDisableWheelProps {
  containerRef: RefObject<HTMLDivElement>;
  scrollerRef: RefObject<HTMLElement>;
}

export const useDisableWheel = ({ containerRef, scrollerRef }: UseDisableWheelProps) => {
  useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      scroller.scrollLeft += event.deltaY ;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, scrollerRef]);
};

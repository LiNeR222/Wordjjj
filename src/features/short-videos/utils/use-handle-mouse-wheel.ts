import { RefObject, useEffect } from 'react';

interface UseHandleMouseWheelProps {
  containerRef: RefObject<HTMLDivElement>;
  scrollTo: {
    next: () => void;
    prev: () => void;
  };
}

export const useHandleMouseWheel = ({ containerRef, scrollTo }: UseHandleMouseWheelProps) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
      }

      if (event.deltaY > 0) scrollTo.next();
      if (event.deltaY < 0) scrollTo.prev();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, scrollTo]);
};

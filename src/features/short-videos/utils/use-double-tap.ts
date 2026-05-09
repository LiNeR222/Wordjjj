import { useCallback, useRef } from 'react';

export const useDoubleTap = (callback: () => void, delay = 300) => {
  const lastTap = useRef<number>(0);
  return useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      callback();
    }
    lastTap.current = now;
  }, [callback, delay]);
};
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';

export const useDidUpdate = (effect: () => void, dependencies: unknown[]) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isFirstRender.current) {
      effect();
    } else {
      isFirstRender.current = false;
    }
  }, dependencies);
}

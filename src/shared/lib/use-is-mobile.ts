import { useEffect, useState } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera;
      const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const isUADataMobile = (navigator as { userAgentData?: { mobile: boolean } }).userAgentData?.mobile ?? false;

      setIsMobile(isMobileUA || isUADataMobile || isCoarsePointer);
    };

    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

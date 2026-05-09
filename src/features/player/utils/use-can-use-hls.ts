import { isServer } from '@/shared/config';
import Hls from 'hls.js';

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export const useCanUseHlsJs = (): boolean => {
  if (isServer) return false;
  const ua = navigator.userAgent;

  const isAppleMobile = /iP(ad|hone|od)/i.test(ua);
  const isMac = ua.includes('Macintosh');
  const isTouchMac = isMac && navigator.maxTouchPoints > 1;
  const isApple = isAppleMobile || isTouchMac;

  const isSafari =
    /^((?!chrome|android|edg|opera|opr|vivaldi|brave).)*safari/i.test(ua) ||
    ((navigator as NavigatorStandalone) && isApple);

  const usesNativeHls = isApple || isSafari;

  if (usesNativeHls) return false;

  const hasMediaSource =
    'MediaSource' in window && MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');

  return hasMediaSource && typeof Hls !== 'undefined' && Hls.isSupported?.();
};

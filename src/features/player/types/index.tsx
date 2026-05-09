export interface PlayerProps {
  fullscreen?: boolean;
  aspectRatio?: string;
  videoId: number;
  controls?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  playsinline?: boolean;
  webkitPlaysinline?: boolean;
  xWebkitAirplay?: boolean;
  time?: number;
}

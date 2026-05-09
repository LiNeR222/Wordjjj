import { BACKEND_ORIGIN } from "../config";

export const getVideoSrc = (videoId: number | null) => {
  if (typeof videoId === 'number') {
    return `${BACKEND_ORIGIN}/api/v1/videos/video/${videoId}?preview=true`;
  }
  return '';
};

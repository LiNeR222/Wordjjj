import { BACKEND_ORIGIN } from '../config';

export const createUploadPreviewUrl = (videoId: number | null) => {
  if (typeof videoId === 'number') {
    return `${BACKEND_ORIGIN}/api/v1/videos/video/${videoId}/preview_image/upload`;
  }
  return undefined;
};

export const createUploadVideoUrl = `${BACKEND_ORIGIN}/api/v1/videos/upload`;
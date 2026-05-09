export const getPreviewVideo = (videoId: number | null) => {
  if (typeof videoId === 'number') {
    return `https://interesnoitochka.ru/api/v1/videos/video/${videoId}?preview=true`;
  }
  return '';
};

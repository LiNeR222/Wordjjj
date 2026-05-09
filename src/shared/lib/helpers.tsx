import { videoRecommendationsKeys, VideoRecommendationsKey } from "@/entities/video/types";

export const markDigitPlace = (value: number | string) => value.toLocaleString('ru-RU');

export const makePercent = (value: number | string) => `${value}%`;

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
  } else {
    return `${paddedMinutes}:${paddedSeconds}`;
  }
};


export const parseSearchParams = (searchParams: URLSearchParams) =>
  Object.fromEntries(
    Array.from(searchParams.entries()).filter(([key]) =>
      videoRecommendationsKeys.includes(key as VideoRecommendationsKey)
    )
  );

import { apiPath, BACKEND_ORIGIN } from "../config";

export const isObject = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && !Array.isArray(value);


interface ErrorResponse {
  error?: string;
  detail?: string;
}

export const extractErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data;
  return (data as ErrorResponse)?.detail || (data as ErrorResponse)?.error || 'Неизвестная ошибка';
};

export const resolveImageURL = (url: string | null | undefined, videoId: number | null) => {
  if (typeof url === 'string' && url.startsWith('http')) return url;
  if (typeof videoId === 'number') {
    return `${BACKEND_ORIGIN}${apiPath}/videos/video/${videoId}?preview=true`;
  }
  return '/images/preview_video_stub.jpg';
};

export async function log(data: unknown) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      body: JSON.stringify({
        data,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.warn('Ошибка при отправке ошибки на сервер', e);
  }
}

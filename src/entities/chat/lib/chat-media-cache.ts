import { BACKEND_ORIGIN, isClient } from '@/shared/config';
import { chatApi } from '../api';

const CHAT_MEDIA_CACHE_NAME = 'chat-media-v1';
const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const CHAT_MEDIA_URL_CACHE_PREFIX = 'chat-media-url-v1';

interface StoredChatMediaUrl {
  url: string;
  expiresAt: string;
}

const buildCacheUrl = (fileId: number, thumbnail = false) =>
  `${BACKEND_ORIGIN}/__chat_media_cache__/${fileId}${thumbnail ? '?thumbnail=1' : ''}`;

const isCacheStorageAvailable = () => isClient && typeof caches !== 'undefined';

const getCache = async () => {
  if (!isCacheStorageAvailable()) {
    return null;
  }

  return caches.open(CHAT_MEDIA_CACHE_NAME);
};

const buildCacheRequest = (fileId: number, thumbnail = false) =>
  new Request(buildCacheUrl(fileId, thumbnail), { method: 'GET' });

const buildStoredUrlKey = (fileId: number, thumbnail = false) =>
  `${CHAT_MEDIA_URL_CACHE_PREFIX}:${fileId}:${thumbnail ? 'thumb' : 'file'}`;

const getStorage = () => {
  if (!isClient || typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getStoredChatMediaUrl = (
  fileId: number,
  thumbnail = false,
) => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(buildStoredUrlKey(fileId, thumbnail));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredChatMediaUrl;
    if (!parsed.url || !parsed.expiresAt) {
      storage.removeItem(buildStoredUrlKey(fileId, thumbnail));
      return null;
    }

    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      storage.removeItem(buildStoredUrlKey(fileId, thumbnail));
      return null;
    }

    return parsed.url;
  } catch {
    storage.removeItem(buildStoredUrlKey(fileId, thumbnail));
    return null;
  }
};

export const storeChatMediaUrl = (
  fileId: number,
  url: string,
  expiresAt: string,
  thumbnail = false,
) => {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(
    buildStoredUrlKey(fileId, thumbnail),
    JSON.stringify({
      url,
      expiresAt,
    } satisfies StoredChatMediaUrl),
  );
};

export const resolveChatMediaUrl = async (
  fileId: number,
  thumbnail = false,
) => {
  const cachedUrl = getStoredChatMediaUrl(fileId, thumbnail);
  if (cachedUrl) {
    return cachedUrl;
  }

  const downloadData = await chatApi.getFileDownloadUrl(fileId, thumbnail);
  storeChatMediaUrl(fileId, downloadData.url, downloadData.expires_at, thumbnail);
  return downloadData.url;
};

export const getCachedChatMediaBlob = async (
  fileId: number,
  thumbnail = false,
) => {
  const cache = await getCache();
  if (!cache) return null;

  const cachedResponse = await cache.match(buildCacheRequest(fileId, thumbnail));
  if (!cachedResponse) return null;

  return cachedResponse.blob();
};

const storeResponseInCache = async (
  fileId: number,
  response: Response,
  thumbnail = false,
) => {
  const cache = await getCache();
  if (!cache) return;

  await cache.put(buildCacheRequest(fileId, thumbnail), response);
};

const fetchChatMediaResponse = async (
  fileId: number,
  thumbnail = false,
) => {
  const directUrl = await resolveChatMediaUrl(fileId, thumbnail);
  const response = await fetch(directUrl, {
    method: 'GET',
    credentials: 'omit',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch media ${fileId}: ${response.status}`);
  }

  return response;
};

export const fetchAndCacheChatMediaBlob = async (
  fileId: number,
  thumbnail = false,
) => {
  const response = await fetchChatMediaResponse(fileId, thumbnail);
  await storeResponseInCache(fileId, response.clone(), thumbnail);
  return response.blob();
};

export const resolveChatMediaBlob = async (
  fileId: number,
  thumbnail = false,
) => {
  const cachedBlob = await getCachedChatMediaBlob(fileId, thumbnail);
  if (cachedBlob) {
    return cachedBlob;
  }

  return fetchAndCacheChatMediaBlob(fileId, thumbnail);
};

export const warmChatMediaCacheFromUrl = async (
  fileId: number,
  directUrl: string,
  expiresAt?: string,
  thumbnail = false,
) => {
  if (!isCacheStorageAvailable()) return;

  if (expiresAt) {
    storeChatMediaUrl(fileId, directUrl, expiresAt, thumbnail);
  }

  const response = await fetch(directUrl, {
    method: 'GET',
    credentials: 'omit',
  });
  if (!response.ok) return;

  const contentType = response.headers.get('Content-Type') ?? DEFAULT_CONTENT_TYPE;
  const normalizedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': contentType,
    },
  });

  await storeResponseInCache(fileId, normalizedResponse, thumbnail);
};

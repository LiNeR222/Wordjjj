import { extractErrorMessage } from '@/shared/lib';
import { SerializedError } from '@/shared/lib/serialized-error';
import Hls, { HlsConfig } from 'hls.js';
import { CustomLoader } from './custom-loader';

export const getHlsLoaders = async (): Promise<Partial<HlsConfig>> => {
  //@ts-expect-error later
  return { loader: CustomLoader };
};

export const decodeErrorResponse = (response: ArrayBuffer): Record<string, unknown> | null => {
  try {
    const decoder = new TextDecoder('utf-8');
    const responseText = decoder.decode(response);
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Ошибка при разборе тела ответа:', error);
    return null;
  }
};

export const extractNumberFromUrl = (url: string, regex: RegExp): number | null => {
  const match = url.match(regex);
  return match && match[1] ? parseInt(match[1], 10) : null;
};

export const getSegmentIdFromUrl = (url: string | undefined): number | null => {
  if (!url) return null;
  const regex = /playlist(\d+)\.ts$/;
  return extractNumberFromUrl(url, regex);
};

export function getSegmentDuration(hls: Hls) {
  return hls.levels?.[hls.currentLevel]?.details?.targetduration;
}

export const parseError = (networkDetails: { status: number; response: ArrayBuffer }): SerializedError => {
  const data =
    typeof networkDetails.response === 'string'
      ? networkDetails.response
      : decodeErrorResponse(networkDetails.response as ArrayBuffer);
  return new SerializedError({ status: networkDetails.status, message: extractErrorMessage(data) });
};

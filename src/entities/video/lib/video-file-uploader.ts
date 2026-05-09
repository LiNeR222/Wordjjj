import axios from 'axios';
import { videoApi } from '../api';
import type {
  VideoUploadCompletePart,
  VideoUploadCompleteResponse,
  VideoUploadPartUrl,
} from '../types';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const DEFAULT_MULTIPART_CONCURRENCY = 3;
const PART_URL_BATCH_SIZE = 500;

export type VideoUploadPhase = 'uploading' | 'finalizing';

interface VideoFileUploaderCallbacks {
  onProgress?: (progress: number) => void;
  onPhaseChange?: (phase: VideoUploadPhase) => void;
  onInit?: (videoId: number) => void;
}

export interface VideoFileUploadTask {
  promise: Promise<VideoUploadCompleteResponse>;
  abort: () => void;
  getVideoId: () => number | null;
  isCompleted: () => boolean;
  isAborted: () => boolean;
}

const getContentType = (file: File) => file.type || DEFAULT_CONTENT_TYPE;

const toError = (error: unknown) => (error instanceof Error ? error : new Error('Ошибка загрузки видео'));

const getEtagFromHeaders = (headers: Record<string, unknown>) => {
  const etag = headers.etag ?? headers.ETag;
  return typeof etag === 'string' && etag.length > 0 ? etag : null;
};

const splitToChunks = (items: number[], chunkSize: number) => {
  const result: number[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    result.push(items.slice(index, index + chunkSize));
  }
  return result;
};

const getMultipartPartUrls = async (videoId: number, totalParts: number) => {
  const allPartNumbers = Array.from({ length: totalParts }, (_, index) => index + 1);
  const partNumbersChunks = splitToChunks(allPartNumbers, PART_URL_BATCH_SIZE);
  const partsByNumber = new Map<number, VideoUploadPartUrl>();

  for (const partNumbers of partNumbersChunks) {
    const response = await videoApi.getVideoUploadPartUrls(videoId, partNumbers);
    for (const part of response.parts) {
      partsByNumber.set(part.part_number, part);
    }
  }

  return partsByNumber;
};

const uploadSingleFile = async (
  file: File,
  uploadUrl: string,
  signal: AbortSignal,
  onProgress?: (progress: number) => void,
) => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': getContentType(file),
    },
    signal,
    onUploadProgress: event => {
      if (!onProgress || !event.total) return;
      onProgress(Math.min(1, event.loaded / event.total));
    },
  });

  onProgress?.(1);
};

const uploadMultipartFile = async (
  file: File,
  videoId: number,
  partSize: number,
  totalParts: number,
  signal: AbortSignal,
  onProgress?: (progress: number) => void,
  multipartConcurrency: number = DEFAULT_MULTIPART_CONCURRENCY,
) => {
  const uploadedByPart = new Map<number, number>();
  const completedParts: VideoUploadCompletePart[] = [];
  const partUrls = await getMultipartPartUrls(videoId, totalParts);
  let nextPartNumber = 1;

  const reportProgress = () => {
    if (!onProgress) return;
    const uploadedBytes = Array.from(uploadedByPart.values()).reduce((sum, value) => sum + value, 0);
    onProgress(Math.min(1, uploadedBytes / file.size));
  };

  const uploadPart = async (partNumber: number) => {
    const part = partUrls.get(partNumber);
    if (!part) {
      throw new Error(`Upload URL is missing for part ${partNumber}`);
    }

    const start = (partNumber - 1) * partSize;
    const end = Math.min(start + partSize, file.size);
    const blobPart = file.slice(start, end);

    const response = await axios.put(part.upload_url, blobPart, {
      headers: {
        'Content-Type': getContentType(file),
      },
      signal,
      onUploadProgress: event => {
        uploadedByPart.set(partNumber, event.loaded);
        reportProgress();
      },
    });

    const etag = getEtagFromHeaders(response.headers as Record<string, unknown>);
    if (!etag) {
      throw new Error(`ETag is missing for uploaded part ${partNumber}`);
    }

    uploadedByPart.set(partNumber, blobPart.size);
    reportProgress();
    completedParts.push({
      part_number: partNumber,
      etag,
    });
  };

  const worker = async () => {
    while (nextPartNumber <= totalParts) {
      const currentPartNumber = nextPartNumber;
      nextPartNumber += 1;
      await uploadPart(currentPartNumber);
    }
  };

  await Promise.all(Array.from({ length: Math.min(multipartConcurrency, totalParts) }, () => worker()));
  completedParts.sort((left, right) => left.part_number - right.part_number);
  return completedParts;
};

export const uploadVideoFile = (
  file: File,
  callbacks: VideoFileUploaderCallbacks = {},
): VideoFileUploadTask => {
  let videoId: number | null = null;
  let completed = false;
  let aborted = false;
  const abortController = new AbortController();

  const runAbort = async () => {
    if (!videoId || completed) return;
    try {
      await videoApi.abortVideoUpload(videoId);
    } catch {
      // Ignore abort errors and keep original upload error.
    }
  };

  const abort = () => {
    if (aborted || completed) return;
    aborted = true;
    abortController.abort();
    void runAbort();
  };

  const promise = (async () => {
    const initResponse = await videoApi.initVideoUpload(file);
    videoId = initResponse.video_id;
    callbacks.onInit?.(videoId);

    if (aborted) {
      await runAbort();
      throw new Error('Upload aborted');
    }

    callbacks.onPhaseChange?.('uploading');

    let parts: VideoUploadCompletePart[] | undefined;
    const isMultipart = initResponse.upload_method === 'multipart';

    if (isMultipart) {
      if (!initResponse.part_size || !initResponse.total_parts) {
        throw new Error('Multipart upload metadata is incomplete');
      }
      parts = await uploadMultipartFile(
        file,
        videoId,
        initResponse.part_size,
        initResponse.total_parts,
        abortController.signal,
        callbacks.onProgress,
      );
    } else {
      if (!initResponse.upload_url) {
        throw new Error('Upload URL is missing for single upload');
      }
      await uploadSingleFile(
        file,
        initResponse.upload_url,
        abortController.signal,
        callbacks.onProgress,
      );
    }

    if (aborted) {
      await runAbort();
      throw new Error('Upload aborted');
    }

    callbacks.onPhaseChange?.('finalizing');
    const completeResponse = await videoApi.completeVideoUpload(videoId, parts);
    completed = true;
    callbacks.onProgress?.(1);
    return completeResponse;
  })().catch(async error => {
    if (!aborted) {
      await runAbort();
    }
    throw toError(error);
  });

  return {
    promise,
    abort,
    getVideoId: () => videoId,
    isCompleted: () => completed,
    isAborted: () => aborted,
  };
};

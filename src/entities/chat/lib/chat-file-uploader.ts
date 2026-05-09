import axios from 'axios';
import { chatApi } from '../api';
import type {
  ChatFileMultipartCompletePart,
  ChatFileUploadInitResponse,
} from '../types';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const MULTIPART_CONCURRENCY = 3;

const getContentType = (file: File) => file.type || DEFAULT_CONTENT_TYPE;

const getEtagFromHeaders = (headers: Record<string, unknown>) => {
  const etag = headers.etag ?? headers.ETag;
  return typeof etag === 'string' && etag.length > 0 ? etag : null;
};

const uploadSingleFile = async (
  file: File,
  initResponse: ChatFileUploadInitResponse,
  onProgress?: (progress: number) => void,
) => {
  if (!initResponse.upload_url) {
    throw new Error('Upload URL is missing for single upload');
  }

  await axios.put(initResponse.upload_url, file, {
    headers: {
      'Content-Type': getContentType(file),
    },
    onUploadProgress: event => {
      if (!onProgress || !event.total) return;
      onProgress(Math.min(1, event.loaded / event.total));
    },
  });

  onProgress?.(1);
  await chatApi.completeFileUpload(initResponse.file_id);
  return initResponse.file_id;
};

const uploadMultipartFile = async (
  file: File,
  initResponse: ChatFileUploadInitResponse,
  onProgress?: (progress: number) => void,
) => {
  const partSize = initResponse.part_size;
  const totalParts = initResponse.total_parts;

  if (!partSize || !totalParts) {
    throw new Error('Multipart upload metadata is incomplete');
  }

  const uploadedByPart = new Map<number, number>();
  const completedParts: ChatFileMultipartCompletePart[] = [];
  let nextPartNumber = 1;

  const reportProgress = () => {
    if (!onProgress) return;
    const uploadedBytes = Array.from(uploadedByPart.values()).reduce((sum, value) => sum + value, 0);
    onProgress(Math.min(1, uploadedBytes / file.size));
  };

  const uploadPart = async (partNumber: number) => {
    const start = (partNumber - 1) * partSize;
    const end = Math.min(start + partSize, file.size);
    const blobPart = file.slice(start, end);
    const partUrlResponse = await chatApi.getMultipartPartUrl(initResponse.file_id, partNumber);

    const response = await axios.put(partUrlResponse.upload_url, blobPart, {
      headers: {
        'Content-Type': getContentType(file),
      },
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

  try {
    await Promise.all(
      Array.from({ length: Math.min(MULTIPART_CONCURRENCY, totalParts) }, () => worker()),
    );

    completedParts.sort((left, right) => left.part_number - right.part_number);
    await chatApi.completeMultipartUpload(initResponse.file_id, completedParts);
    onProgress?.(1);
    return initResponse.file_id;
  } catch (error) {
    try {
      await chatApi.abortMultipartUpload(initResponse.file_id);
    } catch {
      // Ignore abort errors and surface the original failure.
    }
    throw error;
  }
};

export const uploadChatFile = async (
  file: File,
  onProgress?: (progress: number) => void,
) => {
  const initResponse = await chatApi.initFileUpload(file);

  if (initResponse.upload_method === 'multipart') {
    return uploadMultipartFile(file, initResponse, onProgress);
  }

  return uploadSingleFile(file, initResponse, onProgress);
};

export const uploadChatFiles = async (
  files: File[],
  onFileProgress?: (file: File, progress: number) => void,
) =>
  Promise.all(
    files.map(file =>
      uploadChatFile(file, progress => onFileProgress?.(file, progress)),
    ),
  );

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export type ChatVideoQualityPreset = '720p' | '1080p' | 'original';

export interface ChatVideoMetadata {
  width: number;
  height: number;
  duration: number;
}

const IMAGE_MAX_DIMENSION = 1800;
const IMAGE_QUALITY = 0.82;
const VIDEO_PRESET_CONFIG: Record<
  Exclude<ChatVideoQualityPreset, 'original'>,
  {
    maxWidth: number;
    maxHeight: number;
    crf: number;
    maxRate: string;
    bufSize: string;
    label: string;
  }
> = {
  '720p': {
    maxWidth: 1280,
    maxHeight: 720,
    crf: 29,
    maxRate: '2500k',
    bufSize: '5000k',
    label: '720p',
  },
  '1080p': {
    maxWidth: 1920,
    maxHeight: 1080,
    crf: 27,
    maxRate: '4500k',
    bufSize: '9000k',
    label: '1080p',
  },
};

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadingPromise: Promise<FFmpeg> | null = null;

const VIDEO_PREPROCESS_LOG_PREFIX = '[chat-video-preprocess]';
const MAX_DEBUG_LOG_ENTRIES = 30;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
};

const buildVideoPreparationError = (
  stage: string,
  file: File,
  preset: ChatVideoQualityPreset,
  error: unknown,
  ffmpegLogs: string[] = [],
) => {
  const message = getErrorMessage(error);
  const details = ffmpegLogs.length > 0
    ? ` Последние логи ffmpeg: ${ffmpegLogs.join(' | ')}`
    : '';

  return new Error(
    `Не удалось подготовить видео на этапе "${stage}" (${preset}, ${file.name}): ${message}.${details}`.trim(),
  );
};

const loadImageElement = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    image.src = url;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to create image blob'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });

const getOutputImageType = (file: File) => {
  if (file.type === 'image/png') return 'image/png';
  return 'image/jpeg';
};

const getCompressedImageName = (file: File, outputType: string) => {
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return outputType === 'image/png'
    ? `${baseName}.png`
    : `${baseName}.jpg`;
};

const loadFFmpeg = async () => {
  if (ffmpegInstance) return ffmpegInstance;
  if (ffmpegLoadingPromise) return ffmpegLoadingPromise;

  ffmpegLoadingPromise = (async () => {
    console.info(`${VIDEO_PREPROCESS_LOG_PREFIX} loading ffmpeg core`);
    const ffmpeg = new FFmpeg();

    try {
      await ffmpeg.load();
      ffmpegInstance = ffmpeg;
      console.info(`${VIDEO_PREPROCESS_LOG_PREFIX} ffmpeg core loaded`);
      return ffmpeg;
    } catch (error) {
      console.error(`${VIDEO_PREPROCESS_LOG_PREFIX} failed to load ffmpeg core`, error);
      ffmpegLoadingPromise = null;
      throw new Error(
        `Не удалось загрузить модуль обработки видео: ${getErrorMessage(error)}`,
      );
    }
  })();

  return ffmpegLoadingPromise;
};

const getVideoObjectUrl = (file: File) => URL.createObjectURL(file);

export const getChatVideoMetadata = (file: File) =>
  new Promise<ChatVideoMetadata>((resolve, reject) => {
    const video = document.createElement('video');
    const url = getVideoObjectUrl(file);

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load video metadata: ${file.name}`));
    };
    video.src = url;
  });

export const compressChatImageFile = async (file: File) => {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  const image = await loadImageElement(file);
  const maxSide = Math.max(image.width, image.height);
  const scale = maxSide > IMAGE_MAX_DIMENSION ? IMAGE_MAX_DIMENSION / maxSide : 1;
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);
  const outputType = getOutputImageType(file);
  const blob = await canvasToBlob(
    canvas,
    outputType,
    outputType === 'image/png' ? undefined : IMAGE_QUALITY,
  );

  return new File([blob], getCompressedImageName(file, outputType), {
    type: outputType,
    lastModified: Date.now(),
  });
};

const buildVideoOutputName = (file: File, preset: ChatVideoQualityPreset) => {
  const baseName = file.name.replace(/\.[^.]+$/, '');

  if (preset === 'original') {
    return file.name || `${baseName}.mp4`;
  }

  return `${baseName}-${VIDEO_PRESET_CONFIG[preset].label}.mp4`;
};

const buildVideoScaleFilter = (preset: ChatVideoQualityPreset) => {
  if (preset === 'original') {
    return 'setsar=1';
  }

  const config = VIDEO_PRESET_CONFIG[preset];

  return [
    `scale=w=${config.maxWidth}:h=${config.maxHeight}:force_original_aspect_ratio=decrease:force_divisible_by=2`,
    'setsar=1',
  ].join(',');
};

export const compressChatVideoFile = async (
  file: File,
  preset: ChatVideoQualityPreset,
  onProgress?: (progress: number) => void,
) => {
  const ffmpegLogs: string[] = [];

  if (preset === 'original') {
    console.info(`${VIDEO_PREPROCESS_LOG_PREFIX} keeping original video`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    onProgress?.(1);
    return file;
  }

  const ffmpeg = await loadFFmpeg();
  const config = VIDEO_PRESET_CONFIG[preset];
  const inputName = `input-${crypto.randomUUID()}-${file.name}`;
  const outputName = `output-${crypto.randomUUID()}.mp4`;
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.max(0, Math.min(1, progress)));
  };
  const logHandler = ({ message, type }: { message: string; type: string }) => {
    const entry = `${type}: ${message}`;
    ffmpegLogs.push(entry);
    if (ffmpegLogs.length > MAX_DEBUG_LOG_ENTRIES) {
      ffmpegLogs.shift();
    }
    console.debug(`${VIDEO_PREPROCESS_LOG_PREFIX} ffmpeg ${type}`, message);
  };

  ffmpeg.on('progress', progressHandler);
  ffmpeg.on('log', logHandler);

  try {
    console.info(`${VIDEO_PREPROCESS_LOG_PREFIX} preparing video`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      preset,
      target: config.label,
    });

    let fileBytes: Uint8Array;
    try {
      fileBytes = await fetchFile(file);
    } catch (error) {
      throw buildVideoPreparationError('read-input', file, preset, error, ffmpegLogs);
    }

    try {
      await ffmpeg.writeFile(inputName, fileBytes);
    } catch (error) {
      throw buildVideoPreparationError('write-input', file, preset, error, ffmpegLogs);
    }

    let result: number;
    try {
      result = await ffmpeg.exec([
        '-i',
        inputName,
        '-vf',
        buildVideoScaleFilter(preset),
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        String(config.crf),
        '-maxrate',
        config.maxRate,
        '-bufsize',
        config.bufSize,
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        outputName,
      ]);
    } catch (error) {
      throw buildVideoPreparationError('transcode', file, preset, error, ffmpegLogs);
    }

    if (result !== 0) {
      throw buildVideoPreparationError(
        'transcode',
        file,
        preset,
        `FFmpeg exited with code ${result}`,
        ffmpegLogs,
      );
    }

    let bytes: Uint8Array;
    try {
      bytes = await ffmpeg.readFile(outputName) as Uint8Array;
    } catch (error) {
      throw buildVideoPreparationError('read-output', file, preset, error, ffmpegLogs);
    }

    onProgress?.(1);

    console.info(`${VIDEO_PREPROCESS_LOG_PREFIX} video prepared successfully`, {
      fileName: file.name,
      preset,
      inputSize: file.size,
      outputSize: bytes.byteLength,
    });

    return new File([bytes], buildVideoOutputName(file, preset), {
      type: 'video/mp4',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error(`${VIDEO_PREPROCESS_LOG_PREFIX} failed to prepare video`, {
      error,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      preset,
      ffmpegLogs,
    });
    throw error;
  } finally {
    ffmpeg.off('progress', progressHandler);
    ffmpeg.off('log', logHandler);
    try {
      await ffmpeg.deleteFile(inputName);
    } catch {
      // noop
    }
    try {
      await ffmpeg.deleteFile(outputName);
    } catch {
      // noop
    }
  }
};

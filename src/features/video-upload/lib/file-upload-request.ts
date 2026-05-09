import { videoApi } from '@/entities/video/api';
import { uploadVideoFile, VideoUploadPhase } from '@/entities/video/lib/video-file-uploader';
import { UploadRequestOption } from 'rc-upload/lib/interface';

export const fileUploadRequest = async ({
  file,
  onSuccess,
  onError,
  uploadFn,
}: UploadRequestOption & {
  uploadFn: (formData: FormData) => Promise<unknown>;
}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await uploadFn(formData);
    if (response) {
      onSuccess?.(response, file);
    } else {
      onError?.(new Error('Ошибка загрузки'));
    }
  } catch (error) {
    onError?.(error as Error);
  }
};

export const videoUploadRequest = async (options: UploadRequestOption) =>
  fileUploadRequest({ ...options, uploadFn: videoApi.uploadVideo });

type DirectVideoUploadRequestOptions = UploadRequestOption & {
  onPhaseChange?: (phase: VideoUploadPhase) => void;
  onVideoInit?: (videoId: number) => void;
};

const resolveFileFromUploadOption = (file: UploadRequestOption['file']) => {
  if (file instanceof File) {
    return file;
  }
  const fileWithOrigin = file as { originFileObj?: File };
  if (fileWithOrigin.originFileObj instanceof File) {
    return fileWithOrigin.originFileObj;
  }
  throw new Error('Некорректный формат файла для загрузки');
};

export const directVideoUploadRequest = (options: DirectVideoUploadRequestOptions) => {
  let sourceFile: File;
  try {
    sourceFile = resolveFileFromUploadOption(options.file);
  } catch (error) {
    options.onError?.(error as Error);
    return {
      abort: () => undefined,
    };
  }

  const uploadTask = uploadVideoFile(sourceFile, {
    onInit: options.onVideoInit,
    onPhaseChange: options.onPhaseChange,
    onProgress: progress => {
      options.onProgress?.({ percent: Math.min(100, progress * 100) });
    },
  });

  void uploadTask.promise
    .then(response => {
      if (uploadTask.isAborted()) {
        return;
      }
      options.onSuccess?.({ ...response, id: response.video_id }, sourceFile);
    })
    .catch(error => {
      if (uploadTask.isAborted()) {
        return;
      }
      options.onError?.(error as Error);
    });

  return {
    abort: uploadTask.abort,
  };
};

export const imageUploadRequest = async (options: UploadRequestOption & { videoId: number | null }) => {
  if (!options.videoId) {
    options.onError?.(new Error('Video ID is required'));
    return;
  }
  return fileUploadRequest({
    ...options,
    uploadFn: videoApi.uploadPreview.bind(null, Number(options.videoId)),
  });
};

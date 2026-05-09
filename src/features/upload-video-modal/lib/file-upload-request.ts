import { videoApi } from '@/entities/video/api';
import { UploadRequestOption } from 'rc-upload/lib/interface';

export const FileUploadRequest = async ({ file, onSuccess, onError }: UploadRequestOption) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await videoApi.uploadVideo(formData);
    if (response) {
      onSuccess?.(response, file);
    } else {
      onError?.(new Error('Ошибка загрузки видео'));
    }
  } catch (error) {
    onError?.(error as Error);
  }
};

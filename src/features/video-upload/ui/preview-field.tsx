'use client';

import { message } from '@/shared/ui/message';
import { UploadFile, UploadProps } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import { FC, useEffect, useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { imageUploadRequest } from '../lib/file-upload-request';
import { PreviewImage } from './preview-image';

interface PreviewFieldProps {
  isEditMode: boolean;
  videoId: number | null;
}

export const PreviewField: FC<PreviewFieldProps> = ({ isEditMode, videoId }) => {
  const canUploadPreview = videoId !== null;
  const [file, setFile] = useState<UploadFile | null>(null);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);

  useEffect(() => {
    if (file) {
      if (file.status === 'done') {
        setIsPreviewLoaded(true);
        message.success(`${file.name} файл загрузился успешно.`);
      } else if (file.status === 'error') {
        setIsPreviewLoaded(false);
        message.error(`${file.name} файл не загрузился. Попробуйте позже.`);
      }
    } else if (isEditMode) {
      setIsPreviewLoaded(Boolean(videoId));
    } else {
      setIsPreviewLoaded(false);
    }
  }, [isEditMode, videoId, file]);

  const PreviewUploadProps: UploadProps = {
    name: 'file',
    accept: 'image/jpeg, image/png',
    maxCount: 1,
    multiple: false,
    customRequest: options => imageUploadRequest({ ...options, videoId }),
    onChange(info) {
      setFile(info.file);
    },
    onRemove() {
      setFile(null);
    },
  };

  const videoFirst = <span className='text-xs text-gray-400'> (сначала загрузите видео)</span>;

  return (
    <div className='w-full flex flex-col gap-y-2'>
      <p className='text-ml font-semibold'>
        {isPreviewLoaded ? 'Превью видео' : <>Загрузить превью {!canUploadPreview && videoFirst}</>}
      </p>
      {isPreviewLoaded && videoId ? (
        <PreviewImage
          videoId={videoId}
          file={file}
          onPreviewUnset={() => {
            setFile(null);
            setIsPreviewLoaded(false);
          }}
        />
      ) : (
        <Dragger disabled={!canUploadPreview} {...PreviewUploadProps}>
          <div className='flex flex-col items-center justify-center content-center w-full'>
            <FiUpload size={40} className='my-2' />
            <p className='ant-upload-text'>Нажмите или перетащите файл сюда</p>
            <p className='ant-upload-hint'>Поддерживается только фото-формат jpg, png.</p>
          </div>
        </Dragger>
      )}
    </div>
  );
};

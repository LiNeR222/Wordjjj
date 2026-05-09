import { authStore } from '@/entities/auth/model/authStore';
import { createUploadPreviewUrl } from '@/shared/lib/create-upload-video-url';
import { getPreviewVideo } from '@/shared/lib/getVideoPreview';
import { Button } from '@/shared/ui/button/button';
import { message } from '@/shared/ui/message';
import { Image, UploadProps } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import { useEffect, useState, useMemo } from 'react';
import { FiUpload } from 'react-icons/fi';

interface PreviewFieldProps {
  videoId: number | null;
  isModalUpdate: boolean;
}

function PreviewField({ videoId, isModalUpdate }: PreviewFieldProps) {
  const [isUpdatePreview, setIsUpdatePreview] = useState(true);
  
  const uploadUrl = useMemo(() => {
    if (videoId !== null) {
      return createUploadPreviewUrl(videoId);
    }
    return undefined;
  }, [videoId]);
  
  const canUploadPreview = videoId !== null && uploadUrl !== undefined;
  
  const PreviewUploadProps: UploadProps = {
    name: 'file',
    accept: 'image/jpeg, image/png',
    maxCount: 1,
    multiple: false,
    action: uploadUrl,
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
      }
      if (status === 'done') {
        message.success(`${info.file.name} файл загрузился успешно.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} файл не загрузился. Попробуйте позже.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  useEffect(() => {
    if (videoId && isModalUpdate) {
      setIsUpdatePreview(false);
    }
  }, [isModalUpdate, videoId]);

  return (
    <>
      {isModalUpdate && !isUpdatePreview ? (
        <div className='w-full flex-col justify-center content-center items-center gap-y-2'>
          <p className='text-ml font-semibold mb-2'>Превью видео</p>
          <div className='relative w-full h-[140px] flex justify-center items-center overflow-hidden rounded-md mb-2'>
            <div className='absolute inset-0 overflow-hidden z-10'>
              <Image
                src={getPreviewVideo(videoId)}
                alt='Blur preview'
                width='100%'
                height='100%'
                className='object-cover blur-md scale-105'
                preview={false}
              />
            </div>
            <div className='relative z-10 h-full flex justify-center items-center'>
              <Image
                src={getPreviewVideo(videoId)}
                alt='Превью видео'
                width={240}
                height={140}
                className='max-h-full max-w-full rounded-md object-contain'
              />
            </div>
          </div>
          <Button
            onClick={() => setIsUpdatePreview(true)}
            type='primary'
            size='middle'
            variant='solid'
            color='default'
            block>
            Изменить превью видео
          </Button>
        </div>
      ) : (
        <div className='w-full flex flex-col gap-y-2'>
          <p className='text-ml font-semibold'>
            Загрузить превью 
            {!canUploadPreview && <span className='text-xs text-gray-400'> (сначала загрузите видео)</span>}
          </p>
          <Dragger disabled={!canUploadPreview} {...PreviewUploadProps}>
            <div className='flex flex-col items-center justify-center content-center w-full'>
              <FiUpload size={40} className='my-2' />
              <p className='ant-upload-text'>Кликай или перемести файл сюда.</p>
              <p className='ant-upload-hint'>Поддерживается только фото-формат jpg, png.</p>
            </div>
          </Dragger>
          {!canUploadPreview && videoId && (
            <p className='text-xs text-red-500 -mt-1'>
              Невозможно загрузить превью - проверьте наличие загруженного видео.
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default PreviewField;

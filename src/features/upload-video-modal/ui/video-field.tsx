import { authStore } from '@/entities/auth/model/authStore';
import { createUploadVideoUrl } from '@/shared/lib/create-upload-video-url';
import { message } from '@/shared/ui/message';
import { Upload } from '@/shared/ui/upload';
import { UploadProps } from 'antd';
import { useController, UseControllerProps } from 'react-hook-form';
import { FiUpload } from 'react-icons/fi';
import { ISubmitData } from '../types';
import { useState } from 'react';

const { Dragger } = Upload;

interface VideoUploadResponse {
  id: number;
  message?: string | null;
  s3_url?: string | null;
}

function VideoField(props: UseControllerProps<ISubmitData, 'videoId'>) {
  const {
    field,
    fieldState: { error },
  } = useController(props);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const VideoUploadProps: UploadProps = {
    name: 'file',
    accept: 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg,video/x-matroska',
    maxCount: 1,
    multiple: false,
    action: createUploadVideoUrl,
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'uploading') {
        setUploading(true);
      }
      if (status !== 'uploading') {
        setUploading(false);
      }
      if (status === 'done') {
        setPaymentError(null);
        
        const response = info.file.response as VideoUploadResponse;
        if (response && response.id) {
          field.onChange(response.id); 
          message.success(`${info.file.name} файл загрузился успешно. ID видео: ${response.id}`);
        } else {
          message.success(`${info.file.name} файл загрузился успешно`);
        }
      } else if (status === 'error') {
        const response = info.file.response;
        if (response && response.status === 402 && response.detail) {
          setPaymentError(response.detail);
          message.error(`Ошибка: ${response.detail}`);
        } else if (response && response.detail) {
          setPaymentError(response.detail);
          message.error(`Ошибка: ${response.detail}`);
        } else {
          setPaymentError(null);
          message.error(`${info.file.name} файл не загрузился. Попробуйте позже!`);
        }
      }
    },
    onRemove() {
      setPaymentError(null);
      field.onChange(null);
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };
  return (
    <div className='w-full flex flex-col gap-y-2'>
      <p className='text-ml font-semibold'>Загрузить видео</p>
      <Dragger {...VideoUploadProps}>
        <div className='flex flex-col items-center justify-center w-full'>
          <FiUpload size={40} className='my-2' />
          <p className='ant-upload-text'>Кликай или перемести файл сюда.</p>
          <p className='ant-upload-hint'>Поддерживаются видеоформаты (mp4, webm, mov, avi и др.)</p>
          {uploading && <p className='text-blue-500 mt-2'>Загрузка видео...</p>}
        </div>
      </Dragger>
      {/* {field.value && (
        <p className='text-xs text-gray-500 -mt-1'>
          ID видео: {field.value}
        </p>
      )} */}
      {paymentError && (
        <div className='mt-2 p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-500 text-sm'>{paymentError}</p>
          <button
            onClick={() => {
              window.location.search = '?modal=deposit';
            }}
            className='mt-2 text-sm text-white bg-black rounded-md px-3 py-1 hover:opacity-90'
          >
            Пополнить баланс
          </button>
        </div>
      )}
      {error && !paymentError && <p className='text-red-500'>{error.message}</p>}
    </div>
  );
}

export default VideoField;

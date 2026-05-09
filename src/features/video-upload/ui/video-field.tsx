'use client';

import { videoListStore } from '@/entities/video/model/video-list-store';
import { walletStore } from '@/entities/wallet';
import { SerializedError } from '@/shared/lib/serialized-error';
import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { Upload } from '@/shared/ui/upload';
import { Button, Progress, Tag, UploadProps } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { FaWallet } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import { directVideoUploadRequest } from '../lib/file-upload-request';
import { FormValues } from '../types';

const { Dragger } = Upload;
type UploadState = 'idle' | 'uploading' | 'finalizing' | 'uploaded' | 'error';

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const VideoField = observer(() => {
  const { control } = useFormContext<FormValues>();
  const {
    field,
    fieldState: { error: formError },
  } = useController({
    control,
    name: 'video_id',
    rules: { required: 'Файл видео обязательное поле' },
  });
  const [file, setFile] = useState<UploadFile | null>(null);
  const [error, setError] = useState<SerializedError | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const abortUploadRef = useRef<(() => void) | null>(null);
  const isPaymentError = error?.status === 402;
  const { ammount: amount, isLoading, openDepositModal, refreshWalletData } = walletStore;
  const isHydrated = useHydrationState();

  useEffect(() => {
    if (amount === null) {
      refreshWalletData();
    }
  }, [amount, refreshWalletData]);

  useEffect(() => {
    if (!file) {
      field.onChange(null);
      setError(null);
      setUploadPercent(0);
      setUploadState('idle');
      setFileSize(0);
      abortUploadRef.current = null;
      return;
    }

    if (file.status === 'done') {
      field.onChange(file.response?.video_id ?? file.response?.id ?? null);
      setError(null);
      setUploadPercent(100);
      setUploadState('uploaded');
      setFileSize(file.size ?? 0);
      abortUploadRef.current = null;
    } else if (file.status === 'error') {
      const uploadError = file.error as { status?: number; message?: string };
      setError(
        new SerializedError({
          status: file.response?.status ?? uploadError?.status,
          message: file.response?.detail ?? uploadError?.message ?? 'Ошибка загрузки видео',
        })
      );
      setUploadState('error');
      setFileSize(file.size ?? 0);
      abortUploadRef.current = null;
    }
  }, [field, file]);

  const handleVideoUploadRequest: UploadProps['customRequest'] = options => {
    const request = directVideoUploadRequest({
      ...options,
      onPhaseChange: phase => {
        setUploadState(phase === 'finalizing' ? 'finalizing' : 'uploading');
      },
    });

    abortUploadRef.current = request.abort;
    return request;
  };

  const handleRemoveFile = () => {
    if (uploadState !== 'uploaded') {
      abortUploadRef.current?.();
    }
    if (field.value && uploadState === 'uploaded') {
      videoListStore.deleteVideo(field.value);
    }
    setFile(null);
    setError(null);
    setUploadPercent(0);
    setUploadState('idle');
    setFileSize(0);
    field.onChange(null);
    abortUploadRef.current = null;
  };

  const VideoUploadProps: UploadProps = {
    name: 'file',
    accept: 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg,video/x-matroska',
    maxCount: 1,
    multiple: false,
    customRequest: handleVideoUploadRequest,
    showUploadList: false,
    onChange(info) {
      setFile(info.file);
      setFileSize(info.file.size ?? 0);
      if (info.file.status === 'uploading') {
        if (typeof info.file.percent === 'number') {
          setUploadPercent(info.file.percent);
        }
        setUploadState(prevState => (prevState === 'finalizing' ? prevState : 'uploading'));
      }
    },
    onRemove() {
      handleRemoveFile();
      return true;
    },
  };

  return (
    <div className='w-full flex flex-col gap-y-2'>
      <p className='text-ml font-semibold'>Загрузить видео</p>

      {isHydrated && amount === 0 && (
        <span className='inline-flex items-center space-x-2 text-sm text-red-400'>
          <span>Для загрузки видео необходимо пополнить баланс</span>
          <Button
            onClick={openDepositModal}
            className='flex items-center gap-1 px-3 max-[540px]:!px-[10px]'
            style={{ fontWeight: 500 }}
            disabled={isLoading}>
            <FaWallet fontSize={16} /> Пополнить
          </Button>
        </span>
      )}

      <Dragger {...VideoUploadProps} {...(isHydrated && { disabled: amount === 0 })}>
        <div className='flex flex-col items-center justify-center w-full'>
          <FiUpload size={40} className='my-2' />
          <p className='ant-upload-text'>Нажмите или перетащите файл сюда.</p>
          <p className='ant-upload-hint'>Поддерживаются видеоформаты (mp4, webm, mov, avi и др.)</p>
        </div>
      </Dragger>
      {file && (
        <div className='rounded-xl border border-gray-200 bg-white p-3 flex flex-col gap-y-2'>
          <div className='flex items-center justify-between gap-3'>
            <div className='text-sm font-medium truncate'>{file.name || 'video-file'}</div>
            <div className='flex items-center gap-2'>
              {uploadState === 'uploading' && (
                <Tag color='processing' bordered={false}>
                  Загружается
                </Tag>
              )}
              {uploadState === 'finalizing' && (
                <Tag color='blue' bordered={false}>
                  Финализация
                </Tag>
              )}
              {uploadState === 'uploaded' && (
                <Tag color='success' bordered={false}>
                  Загружено
                </Tag>
              )}
              {uploadState === 'error' && (
                <Tag color='error' bordered={false}>
                  Ошибка
                </Tag>
              )}
              <Button size='small' type='text' danger onClick={handleRemoveFile}>
                {uploadState === 'uploaded' ? 'Удалить' : 'Отменить'}
              </Button>
            </div>
          </div>

          {uploadState === 'uploading' && (
            <>
              <Progress
                percent={Math.min(100, Math.max(0, Number(uploadPercent.toFixed(1))))}
                strokeColor={{ from: '#3b82f6', to: '#06b6d4' }}
                trailColor='#e5e7eb'
                strokeWidth={10}
                showInfo
              />
              <div className='text-xs text-gray-500'>
                {formatBytes((fileSize * uploadPercent) / 100)} из {formatBytes(fileSize)}
              </div>
            </>
          )}

          {uploadState === 'finalizing' && (
            <div className='text-sm text-blue-600'>Файл загружен, подтверждаем и запускаем обработку...</div>
          )}
        </div>
      )}

      {isPaymentError && (
        <div className='mt-2 p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-500 text-sm'>{error.message}</p>
          <Link href={{ query: { modal: 'deposit' } }}>
            <button type='button' className='mt-2 text-sm text-white bg-black rounded-md px-3 py-1 hover:opacity-90'>
              Пополнить баланс
            </button>
          </Link>
        </div>
      )}
      {error && !isPaymentError && <p className='text-red-500'>{error.message}</p>}
      {formError && <p className='text-red-500'>{formError.message}</p>}
    </div>
  );
});

'use client';

import type {
  ChatVideoMetadata,
  ChatVideoQualityPreset,
} from '@/entities/chat/lib/chat-media-preprocess';
import { Modal } from '@/shared/ui/modal';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ChatVideoPrepareModalProps {
  file: File | null;
  metadata: ChatVideoMetadata | null;
  open: boolean;
  processing: boolean;
  progress: number;
  error: string | null;
  onCancel: () => void;
  onConfirm: (quality: ChatVideoQualityPreset) => Promise<void>;
}

const formatDuration = (duration: number) => {
  if (!Number.isFinite(duration)) return '0:00';
  const totalSeconds = Math.max(0, Math.round(duration));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const QUALITY_OPTIONS: Array<{
  value: ChatVideoQualityPreset;
  label: string;
  hint: string;
}> = [
  {
    value: 'original',
    label: 'Исходное качество',
    hint: 'Без подготовки, быстрее к отправке',
  },
  {
    value: '1080p',
    label: '1080p',
    hint: 'Более чёткая картинка',
  },
  {
    value: '720p',
    label: '720p',
    hint: 'Легче файл и быстрее загрузка',
  },
];

export const ChatVideoPrepareModal = ({
  file,
  metadata,
  open,
  processing,
  progress,
  error,
  onCancel,
  onConfirm,
}: ChatVideoPrepareModalProps) => {
  const [quality, setQuality] = useState<ChatVideoQualityPreset>('original');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setQuality('original');
      setIsDropdownOpen(false);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setQuality('original');
    setIsDropdownOpen(false);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const sourceResolution = useMemo(() => {
    if (!metadata) return null;
    return `${metadata.width}x${metadata.height}`;
  }, [metadata]);

  const qualityLabel = useMemo<Record<ChatVideoQualityPreset, string>>(
    () => ({
      original: 'Исходное качество',
      '1080p': '1080p',
      '720p': '720p',
    }),
    [],
  );

  const selectedQualityOption = QUALITY_OPTIONS.find(option => option.value === quality);

  return (
    <Modal
      open={open}
      centered
      width={560}
      footer={null}
      closable={!processing}
      maskClosable={!processing}
      onCancel={processing ? undefined : onCancel}
      title={<span className='text-xl font-semibold'>Подготовить видео</span>}>
      <div className='flex flex-col gap-4'>
        <div className='relative overflow-hidden rounded-2xl border border-black/5 bg-neutral-950 shadow-[0_16px_40px_rgba(0,0,0,0.14)]'>
          {previewUrl ? (
            <video
              src={previewUrl}
              controls
              playsInline
              className='w-full max-h-[320px] object-contain bg-black'
            />
          ) : (
            <div className='h-[220px] bg-neutral-900 animate-pulse' />
          )}
          <div className='pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 via-black/10 to-transparent' />
          <div ref={dropdownRef} className='absolute right-3 top-3'>
            <button
              type='button'
              disabled={processing}
              onClick={() => setIsDropdownOpen(open => !open)}
              className={`group flex min-w-[210px] items-center justify-between gap-3 rounded-2xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-left text-white shadow-lg backdrop-blur-md transition-all duration-200 ${
                processing
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:-translate-y-0.5 hover:bg-black/70 hover:shadow-[0_14px_32px_rgba(0,0,0,0.28)] active:scale-[0.98]'
              }`}>
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold'>
                  {selectedQualityOption?.label || qualityLabel[quality]}
                </p>
                <p className='truncate text-[11px] text-white/70'>
                  {selectedQualityOption?.hint || 'Качество отправки'}
                </p>
              </div>
              <svg
                viewBox='0 0 20 20'
                aria-hidden='true'
                className={`h-4 w-4 shrink-0 text-white/80 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}>
                <path
                  d='M5.5 7.5L10 12l4.5-4.5'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.8'
                />
              </svg>
            </button>

            {isDropdownOpen ? (
              <div className='absolute right-0 mt-2 w-[240px] origin-top-right animate-fade-in-scale rounded-2xl border border-white/10 bg-[#101216]/95 p-2 text-white shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-xl'>
                {QUALITY_OPTIONS.map(option => {
                  const isSelected = option.value === quality;

                  return (
                    <button
                      key={option.value}
                      type='button'
                      onClick={() => {
                        setQuality(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                          : 'hover:bg-white/8 hover:translate-x-0.5'
                      }`}>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-white'>{option.label}</p>
                        <p className='mt-0.5 text-[11px] text-white/60'>{option.hint}</p>
                      </div>
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-200 ${
                          isSelected ? 'bg-blue-400 shadow-[0_0_0_4px_rgba(96,165,250,0.18)]' : 'bg-white/20'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium text-gray-900'>
                {file?.name || 'Видео'}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {sourceResolution ? `Исходник: ${sourceResolution}` : 'Читаем параметры видео...'}
                {metadata ? ` · ${formatDuration(metadata.duration)}` : ''}
              </p>
            </div>
            <span className='rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 border border-gray-200'>
              медиа
            </span>
          </div>
        </div>

        {processing ? (
          <div className='rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3'>
            <div className='flex items-center justify-between gap-3 mb-2'>
              <p className='text-sm font-medium text-blue-900'>Подготавливаем видео</p>
              <span className='text-xs font-medium text-blue-700'>{Math.round(progress * 100)}%</span>
            </div>
            <div className='h-2 rounded-full bg-blue-100 overflow-hidden'>
              <div
                className='h-full rounded-full bg-blue-500 transition-all duration-300'
                style={{ width: `${Math.max(6, progress * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
            {error}
          </div>
        ) : null}

        {!processing ? (
          <p className='animate-fade-in-scale text-xs text-gray-500'>
            Выбрано: {qualityLabel[quality]}
          </p>
        ) : null}

        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={onCancel}
            disabled={processing}
            className='rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'>
            Отмена
          </button>
          <button
            type='button'
            onClick={() => void onConfirm(quality)}
            disabled={processing || !file}
            className='rounded-xl bg-blue-500 px-4 py-2 text-sm text-white shadow-[0_12px_30px_rgba(59,130,246,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-[0_16px_34px_rgba(59,130,246,0.36)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'>
            {processing ? 'Подготавливаем...' : 'Добавить в сообщение'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

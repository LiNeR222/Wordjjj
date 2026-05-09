'use client';

import { fetchVideoDetails } from '@/entities/video/api/server';
import { useSearchAppParams } from '@/shared/hooks';
import { Button } from '@/shared/ui/button/button';
import { Modal } from '@/shared/ui/modal';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { onSubmit } from './lib/onsubmit-video-uploading-modal';
import { ISubmitData } from './types';
// import DescriptionAIField from './ui/description-ai-field';
import DescriptionField from './ui/description-field';
import PreviewField from './ui/preview-field';
import ProductField from './ui/product-field';
import RewindField from './ui/rewind-field';
import SwitcherField from './ui/switcher-field';
import TagField from './ui/tag-field';
import { TelegramUploading } from './ui/telegram-uploading';
import TitleField from './ui/title-field';
import VideoField from './ui/video-field';
import PlaylistField from './ui/playlist-field';
import VideoTypeField from './ui/video-type-field';
import WebhookField from './ui/webhook-field';
import { authStore } from '@/entities/auth/model/authStore';

export interface IProductResult {
  name: string;
  id: number;
}

const defaultValues: ISubmitData = {
  title: '',
  description: '',
  metadata_ai_description: '',
  tags: [],
  timeNo: {
    reg: 0,
    pay: 0,
  },
  categories: [],
  isVertical: false,
  isFreeVideo: true,
  isAllowRewind: false,
  videoId: null,
  preview_image: '',
  playlistId: null,
  videoType: 'public',
  isPremium: false,
  webhookUrl: '',
  webhookTrigger: 'view_start', 
};

export const UploadVideoModal: FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IProductResult[]>([]);
  const { editSearchParams, getSearchParamValue } = useSearchAppParams();
  const videoIdSearchParam = Number(getSearchParamValue('video_id'));
  const isModalUpload = getSearchParamValue('modal') === 'upload';
  const isModalUpdate = getSearchParamValue('modal') === 'update';
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isUserPro, setIsUserPro] = useState(false);
  const [initialPlaylistId, setInitialPlaylistId] = useState<number | null>(null);

  const { control, handleSubmit, reset, getValues, watch } = useForm<ISubmitData>({
    defaultValues,
    shouldFocusError: false,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const isPremium = watch('isPremium');
  const currentVideoId = watch('videoId');
  
  useEffect(() => {
    setIsUserPro(authStore.user?.is_pro || false);
  }, []);
  
  useEffect(() => {
  }, [currentVideoId]);
  
  useEffect(() => {
    setIsPremiumUser(isPremium);
  }, [isPremium]);

  useEffect(() => {
    if (!isModalUpload && isModalUpdate) {
      if (videoIdSearchParam) {
        fetchVideoDetails(videoIdSearchParam).then(response => {
          setIsOpenModal(true);
          if (response.data) {
            const video = response.data;
            const premiumStatus = Boolean(video.permission_rewind || 
                              (video.time_not_pay && video.time_not_pay > 0));
            
            setIsPremiumUser(premiumStatus);
            
            reset({
              title: video.title || '',
              description: video.description || '',
              categories: video.categories || [],
              tags: video.tags || [],
              metadata_ai_description: video.metadata_ai_description || '',
              videoId: video.video_id,
              timeNo: {
                reg: Number(video.time_not_reg) || 0,
                pay: Number(video.time_not_pay) || 0,
              },
              isVertical: Boolean(video.vertical),
              isFreeVideo: Boolean(video.free),
              isAllowRewind: Boolean(video.permission_rewind),
              playlistId: video.playlist_id || null,
              videoType: (video.format_video as 'public' | 'private' | 'link') || 'public',
              isPremium: premiumStatus,
              webhookUrl: '',
              preview_image: '',
            });
            setInitialPlaylistId(video.playlist_id || null);
          }
        });
      }
    }
    if (!isModalUpload && !isModalUpdate) {
      setIsOpenModal(false);
    }
    if (isModalUpload && !isModalUpdate) {
      setIsOpenModal(true);
    }
  }, [isModalUpdate, isModalUpload, videoIdSearchParam, reset]);

  return (
    <Modal
      open={isOpenModal}
      title={<span className='text-2xl font-bold'>Поделиться видео</span>}
      onCancel={() => {
        editSearchParams('remove', ['video_id', 'modal']);
        setProductId(null);
        setQuery('');
        setInitialPlaylistId(null);
        reset(defaultValues);
      }}
      centered={true}
      footer={null}
      wrapClassName='py-[30px]'
      width={500}>
      <form
        onSubmit={handleSubmit(data => {
          onSubmit(data, selected, productId, setProductId, setQuery, setSelected, () => {
            editSearchParams('remove', ['modal', 'video_id']);
          }, initialPlaylistId);
          reset(defaultValues);
        })}
        className='flex flex-col gap-y-4'>
        {videoIdSearchParam ? (
          <TelegramUploading
            control={control}
            name='videoId'
            videoIdSearchParam={videoIdSearchParam}
            isModalUpdate={isModalUpdate}
          />
        ) : (
          <VideoField control={control} name='videoId' />
        )}
        <PreviewField isModalUpdate={isModalUpdate} videoId={currentVideoId} />
        <TitleField control={control} name='title' rules={{ required: 'Название видео обязательное поле' }} />
        <DescriptionField
          control={control}
          name='description'
          rules={{ required: 'Описание видео обязательное поле' }}
        />
        <TagField label='Теги' placeholder='Добавить тег' control={control} name='tags' />
        <TagField label='Категории' placeholder='Добавить категорию' control={control} name='categories' />
        <SwitcherField control={control} name='isVertical' label='Вертикальное видео' />
        <VideoTypeField control={control} name='videoType' />
        <RewindField
          label='Макс. время просмотра для незарегистрированных пользователей'
          control={control}
          name='timeNo.reg'
        />
        <PlaylistField control={control} name='playlistId' />
        
        {isUserPro && (
          <SwitcherField 
            control={control} 
            name='isPremium' 
            label='Премиум опции' 
            onChange={(checked: boolean) => setIsPremiumUser(checked)}
          />
        )}
        
        {isUserPro && isPremiumUser && (
          <>
            <RewindField 
              label='Макс. время просмотра для бесплатных пользователей' 
              control={control} 
              name='timeNo.pay' 
              minValue={getValues('timeNo.reg')} 
            />
            <SwitcherField control={control} name='isAllowRewind' label='Разрешена перемотка' />
            <WebhookField control={control} name='webhookUrl' />
            <ProductField
              query={query}
              setQuery={setQuery}
              results={results}
              setResults={setResults}
              setProductId={setProductId}
              showModal={true}
            />
          </>
        )}
        
        {/* <DescriptionAIField
          control={control}
          name='metadata_ai_description'
        /> */}
        
        <Button type='primary' size='large' variant='solid' color='default' htmlType='submit' block>
          {isModalUpdate ? 'Редактировать видео' : 'Поделиться видео'}
        </Button>
      </form>
    </Modal>
  );
};

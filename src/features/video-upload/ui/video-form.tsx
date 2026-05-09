'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { myVideoStore } from '@/entities/video/model/my-video-store';
import { videoListStore } from '@/entities/video/model/video-list-store';
import { ICreateVideoData, VideoDetailed } from '@/entities/video/types';
import { Button } from '@/shared/ui/button/button';
import { playlistApi } from '@/entities/playlist/api';
import { ConfigProvider, Input, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { FC, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { defaultValues } from '../config';
import { usePremiumSwitch } from '../lib/use-premium-switch';
import { useModal } from '../model/context';
import { FormValues } from '../types';
// import { DescriptionAIField } from './description-ai-field';
import { DescriptionField } from './description-field';
import PlaylistField from './playlist-field';
import { PremiumBlurOverlay } from './premium-blur-overlay';
import { PreviewField } from './preview-field';
import { ProductField } from './product-field';
import { RewindField } from './rewind-field';
import { SwitcherField } from './switcher-field';
import { TagField } from './tag-field';
import { TitleField } from './title-field';
import { VideoField } from './video-field';
import { VideoReload } from './video-reload';
import { VideoTypeField } from './video-type-field';
import { Webhook } from './webhook';
import { VideoExpiration } from './video-expiration';

interface VideoFormProps {
  video?: VideoDetailed;
}

export const VideoForm: FC<VideoFormProps> = observer(({ video }) => {
  const methods = useForm<FormValues>({
    defaultValues: video || defaultValues,
    shouldFocusError: false,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const { closeModal } = useModal();
  const isEditMode = Boolean(video);
  const videoId = methods.watch('video_id');
  const isAdvertisement = methods.watch('advertisement');
  const { isPremiumBlockVisible, PremiumSwitch } = usePremiumSwitch({ isPro: authStore.isPro, video });

  const webhookRef = useRef<{ submitWebhooks: () => void }>(null);

  const onSubmit = async (data: FormValues) => {
    try {
      const createdVideo = await videoListStore.createVideo(data as unknown as ICreateVideoData);
      if (isEditMode) {
        const initialPlaylistId = video?.playlist_id || null;
        const currentPlaylistId = methods.getValues('playlist_id') || null;
        const vid = createdVideo.video_id;
        try {
          if (initialPlaylistId && initialPlaylistId !== currentPlaylistId) {
            await playlistApi.removeVideosFromPlaylist(initialPlaylistId, { video_ids: [vid] });
          }
          if (currentPlaylistId && initialPlaylistId !== currentPlaylistId) {
            await playlistApi.addVideosToPlaylist(currentPlaylistId, { video_ids: [vid] });
          }
        } catch (e) {
          console.error('Failed to sync playlist membership', e);
        }
      } else {
        const currentPlaylistId = methods.getValues('playlist_id') || null;
        const vid = createdVideo.video_id;
        if (currentPlaylistId) {
          try {
            await playlistApi.addVideosToPlaylist(currentPlaylistId, { video_ids: [vid] });
          } catch (e) {
            console.error('Failed to add video to playlist on create', e);
          }
        }
      }
      queueMicrotask(() => {
        myVideoStore.addVideo(createdVideo);
        videoListStore.addVideo(createdVideo);
        webhookRef.current?.submitWebhooks();
        message.success('Видео успешно создано');
        closeModal();
      });
    } catch (error) {
      console.error(error);
      message.error('Ошибка при создании видео');
    }
  };

  const onError = () => {
    message.error('В форме есть ошибки, проверьте все поля');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#5570F1',
        },
      }}>
      <FormProvider {...methods}>
        <form onSubmit={event => void methods.handleSubmit(onSubmit, onError)(event)} className='flex flex-col gap-y-4'>
          {isEditMode && videoId ? <VideoReload /> : <VideoField />}
          <PreviewField isEditMode={isEditMode} videoId={videoId} />
          <TitleField />
          <DescriptionField />
          <TagField name='tags' />
          <TagField name='categories' />
          <SwitcherField name='vertical' />
          <VideoTypeField />
          <RewindField name='time_not_reg' />
          <PlaylistField />
          <PremiumSwitch />
          {isPremiumBlockVisible && (
            <PremiumBlurOverlay isBlurred={!authStore.isPro}>
              <>
                <SwitcherField name='permission_rewind' />
                <RewindField name='time_not_pay' />
                <Webhook videoId={videoId} webhookRef={webhookRef} />
                <VideoExpiration />
                <ProductField />
              </>
            </PremiumBlurOverlay>
          )}
          <SwitcherField name='advertisement' />
          {isAdvertisement && (
            <Input
              placeholder='ERID токен'
              {...methods.register('erid_text')}
              value={methods.watch('erid_text') ?? ''}
              onChange={e => methods.setValue('erid_text', e.target.value || null)}
            />
          )}
          {/* <DescriptionAIField /> */}
          <Button type='primary' size='large' variant='solid' color='default' htmlType='submit' block>
            {isEditMode ? 'Редактировать видео' : 'Поделиться видео'}
          </Button>
        </form>
      </FormProvider>
    </ConfigProvider>
  );
});

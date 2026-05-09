import { myVideoStore } from '@/entities/video/model/my-video-store';
import { videoListStore } from '@/entities/video/model/video-list-store';
import { VideoDetailed } from '@/entities/video/types';
import { playlistApi } from '@/entities/playlist/api';
import { webhookApi } from '@/entities/webhook/api';
import { message } from '@/shared/ui/message';
import { Dispatch, SetStateAction } from 'react';
import { ISubmitData } from '../types';

const { addVideo, createVideo } = videoListStore;

export const onSubmit = async (
  data: ISubmitData,
  selected: string | null,
  productId: number | null,
  setProductId: Dispatch<SetStateAction<number | null>>,
  setQuery: Dispatch<SetStateAction<string>>,
  setSelected: Dispatch<SetStateAction<string | null>>,
  removeModal: () => void,
  initialPlaylistId?: number | null
) => {
  try {
    const {
      title,
      description,
      metadata_ai_description,
      timeNo,
      tags,
      isFreeVideo,
      isVertical,
      isAllowRewind,
      categories,
      videoId,
      videoType,
      playlistId,
      webhookUrl,
      isPremium,
    } = data;

    if (!videoId) {
      message.error('Загрузите видео');
      return;
    }

    const createdVideo = await createVideo({
      video_id: videoId,
      title,
      description,
      channel_id: 1,
      playlist_id: playlistId,
      free: isFreeVideo,
      vertical: isVertical,
      permission_rewind: isAllowRewind,
      time_not_reg: timeNo.reg,
      time_not_pay: isPremium ? timeNo.pay : 0,
      format_video: videoType,
      date_publication: new Date(),
      metadata_subtitles: '',
      metadata_ai_description,
      tags: tags,
      categories,
      productId: isPremium ? productId : null,
      advertisement: false,
      erid_text: null,
    });

    if (isPremium && webhookUrl && webhookUrl.trim() !== '') {
      try {
        await webhookApi.createVideoWebhook(videoId, webhookUrl);
        console.log('Webhook создан успешно');
      } catch (error) {
        console.error('Ошибка при создании webhook:', error);
        message.error('Не удалось создать webhook, но видео было загружено');
      }
    }

    try {
      const currentPlaylistId = playlistId || null;
      const vid = createdVideo.video_id;
      if (typeof initialPlaylistId !== 'undefined') {
        if (initialPlaylistId && initialPlaylistId !== currentPlaylistId) {
          await playlistApi.removeVideosFromPlaylist(initialPlaylistId, { video_ids: [vid] });
        }
        if (currentPlaylistId && initialPlaylistId !== currentPlaylistId) {
          await playlistApi.addVideosToPlaylist(currentPlaylistId, { video_ids: [vid] });
        }
      } else {
        if (currentPlaylistId) {
          await playlistApi.addVideosToPlaylist(currentPlaylistId, { video_ids: [vid] });
        }
      }
    } catch (err) {
      console.error('Ошибка синхронизации плейлиста', err);
    }

    queueMicrotask(() => {
      myVideoStore.addVideo(createdVideo);
      addVideo(createdVideo as unknown as VideoDetailed);
    });

    removeModal();
    setQuery('');
    setSelected(null);
    setProductId(null);
    message.success('Видео опубликовано');
  } catch (err) {
    console.log(err);
    message.error('Не удалось опубликовать видео. Попробуйте позже');
  }
};

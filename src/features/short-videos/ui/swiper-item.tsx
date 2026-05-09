'use client';
import { channelApi } from '@/entities/channel/api';
import { ChannelAvatar } from '@/entities/channel/ui/channel_avatar';
import { videoListStore } from '@/entities/video/model/video-list-store';
import { likeListStore } from '@/entities/like/model/likeListStore';
import { Video } from '@/entities/video/types';
import { VideoTitle } from '@/entities/video/ui/title';
import { VideoProvider } from '@/features/player/ui/provider';
import { Button } from '@/shared/ui/button';
import { observer } from 'mobx-react-lite';
import { FC, Suspense, useEffect, useState } from 'react';
import { useDoubleTap } from 'use-double-tap';
import { useHandleMobileTogglePlay } from '../utils/use-handle-mobile-toggle-play';
import { PlayIcon } from './play-icon';
import { SwiperPaused } from './swiper-paused';
import { SwiperProgress } from './swiper-progress';
import { CommentsDrawer } from './comments-drawer';

interface SwiperItemProps {
  video: Video;
  isActive: boolean;
}

export const SwiperItem: FC<SwiperItemProps> = observer(({ video, isActive }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const videoId = video.video_id;
  const videoStore = videoListStore.videos.get(videoId);
  const player = videoStore?.player;
  const likeStore = likeListStore.likes?.[videoId];

  useHandleMobileTogglePlay({
    player: player || null,
    isActive,
    isInteracted: player?.isInteracted || false,
  });

  const doubleTap = useDoubleTap(() => {
    if (!isActive) return;
    likeStore?.putLike('like');
  });

  useEffect(() => {
    if (!videoStore) {
      videoListStore.fetchVideoById(videoId);
    }
  }, [videoId, videoStore]);

  const subscribe = async () => {
    try {
      await channelApi.subscribe(video.channel_id, { notifications: true });
      setIsSubscribed(true);
    } catch (error) {
      setIsSubscribed(false);
      console.error(error);
    }
  };

  return (
    <div className='flex flex-col justify-center h-full relative rounded-none sm:rounded-3xl overflow-hidden' {...doubleTap}>
      <Suspense fallback={<div>Loading...</div>}>
        <VideoProvider aspectRatio='9:16' videoId={video.video_id} controls={false} loop />
        <div className='absolute bottom-6 w-full text-white z-30 flex flex-col gap-2 px-3'>
          <div className='flex items-center gap-2 font-semibold'>
            <ChannelAvatar
              channel={{ id: video.channel_id, name: video.channel_name, avatar: video.channel_avatar }}
              className='!rounded-full'
              size={28}
            />
            <p>{video.channel_name}</p>
            {!isSubscribed && (
              <Button size='small' className='!border-white' onClick={subscribe}>
                Подписаться
              </Button>
            )}
          </div>
          <span className='text-sm text-gray-300'>
            <VideoTitle
              title={video.title}
              columns={2}
              className='text-white font-normal tracking-[-0.24px] font-size-[14px]'
            />
          </span>
        </div>
      </Suspense>
      {isActive && player?.isSettled && (
        <>
          <SwiperProgress duration={player.duration} currentTime={player.currentTime} seek={player.seek} />
          <SwiperPaused isPaused={player.isPaused} play={player.play} />
          <PlayIcon player={player} isInteracted={player.isInteracted} isReady={player.isReady} />
        </>
      )}
      <CommentsDrawer open={commentsOpen} onClose={() => setCommentsOpen(false)} videoId={video.video_id} />
    </div>
  );
});
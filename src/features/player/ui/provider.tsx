'use client';

import { videoListStore } from '@/entities/video/model/video-list-store';
import { useHydrationState } from '@/shared/lib/use-hydration-state';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';
import { PlayerProps } from '../types';
import { useCanUseHlsJs } from '../utils/use-can-use-hls';
import { NativePlayer } from './native-player';
import styles from './style.module.css';
import { TimeControl } from './time-control';

const HlsPlayer = dynamic(() => import('@/features/player/ui/player').then(mod => mod.default), {
  ssr: false,
});

export const VideoProvider: FC<PlayerProps> = observer(props => {
  const { fullscreen, videoId, time, autoPlay } = props;
  const [isNativeHlsSupported, setIsNativeHlsSupported] = useState<boolean | null>(null);
  const canUseHlsJs = useCanUseHlsJs();
  const videoStore = videoListStore.videos.get(videoId);
  const isHydrated = useHydrationState();

  const handleAutoPlay = async () => {
    if (!videoStore?.player.playerElement) return;
    try {
      videoStore.player.playerElement.muted = true;
      await videoStore.player.playerElement.play();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!videoStore) {
      videoListStore.fetchVideoById(videoId);
    }

    if (videoStore && videoStore.player.playerElement && time) {
      if (time) {
        videoStore.player.playerElement.currentTime = Number(time);
      }
    }

    return () => {
      videoStore?.clearPlayer();
    };
  }, [videoId, videoStore, time]);

  const isReady = videoStore?.player.isReady;

  useEffect(() => {
    if (isReady && videoStore.player.playerElement) {
      if (time) {
        videoStore.player.setCurrentTime(Number(time));
        videoStore.player.playerElement.currentTime = Number(time);
      }

      if (autoPlay) {
        handleAutoPlay();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, time]);

  useEffect(() => {
    const video = document.createElement('video');
    setIsNativeHlsSupported(Boolean(video.canPlayType('application/vnd.apple.mpegurl')));
  }, []);

  if (!isHydrated) return;

  if (isNativeHlsSupported === null || !videoStore) {
    return null;
  }

  const PlayerComponent = isNativeHlsSupported && !canUseHlsJs ? NativePlayer : HlsPlayer;

  return (
    <div
      className={clsx('w-full h-auto sm:h-full relative bg-black', styles['player-wrapper'], {
        [styles['fullscreen']]: fullscreen,
      })}>
      <PlayerComponent key={videoStore?.player.key || 1} {...props} />
      <TimeControl videoId={videoId} />
    </div>
  );
});

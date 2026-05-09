import { videoListStore } from '@/entities/video/model/video-list-store';
//import Hls from 'hls.js';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { PlayerProps } from '../types';
import { convertRatio } from '../utils';

export const NativePlayer: FC<PlayerProps> = ({ aspectRatio = '16:9', videoId, ...rest }) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [isSettled, setIsSettled] = useState(false);
  const playerElement = playerRef.current;
  const player = videoListStore.videos.get(videoId)!.player;
  //const hlsRef = useRef<any>(null);

  useEffect(() => {
    if (!isSettled || !playerElement) return;

    let isMetadataLoaded = false;
    let isCanPlay = false;

    const tryEmitReady = () => {
      if (isMetadataLoaded && isCanPlay) {
        player.setIsReady();
      }
    };

    const handleLoadedMetadata = () => {
      isMetadataLoaded = true;
      tryEmitReady();
    };

    const handleCanPlay = () => {
      isCanPlay = true;
      tryEmitReady();
    };

    const handleTimeUpdate = () => {
      player.setCurrentTime(playerElement.currentTime ?? 0);
    };

    const handleUpdateStatus = () => {
      player.setIsPaused();
    };
    /* const hls = new Hls();
    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(playerRef.current);*/

    playerElement.addEventListener('timeupdate', handleTimeUpdate);
    playerElement.addEventListener('seeking', handleTimeUpdate);
    playerElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    playerElement.addEventListener('canplay', handleCanPlay);
    playerElement.addEventListener('play', handleUpdateStatus);
    playerElement.addEventListener('pause', handleUpdateStatus);
    return () => {
      playerElement.removeEventListener('timeupdate', handleTimeUpdate);
      playerElement.removeEventListener('seeking', handleTimeUpdate);
      playerElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      playerElement.removeEventListener('canplay', handleCanPlay);
      playerElement.removeEventListener('play', handleUpdateStatus);
      playerElement.removeEventListener('pause', handleUpdateStatus);
    };
  }, [player, isSettled, playerElement]);

  const refCallback = useCallback(
    (node: HTMLVideoElement) => {
      if (node !== null) {
        playerRef.current = node;
        player.setPlayerElement(node);
        setIsSettled(true);
      }
    },
    [player]
  );

  const src = `https://interesnoitochka.ru/api/v1/videos/video/${videoId}/hls/playlist.m3u8`;
  const poster = `https://interesnoitochka.ru/api/v1/videos/video/${videoId}?preview=true`;

  return (
    <video
      controls
      playsInline
      src={src}
      ref={refCallback}
      poster={poster}
      {...rest}
      className={`w-full`}
      style={{
        aspectRatio: convertRatio(aspectRatio),
      }}
    />
  );
};

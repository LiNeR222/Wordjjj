'use client';
import { SerializedError } from '@/shared/lib/serialized-error';
import { Icon } from '@/shared/ui';
import '@vime/core/themes/default.css';
import {
  ClickToPlay,
  Control,
  ControlGroup,
  Controls,
  ControlSpacer,
  DblClickFullscreen,
  FullscreenControl,
  Hls,
  PipControl,
  PlaybackControl,
  Player,
  ScrubberControl,
  SettingsControl,
  TimeProgress,
  Tooltip,
  Ui,
  VolumeControl,
} from '@vime/react';

import { videoListStore } from '@/entities/video/model/video-list-store';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useMediaQuery } from 'usehooks-ts';
import { formatVideoStore } from '../model/format-video-player-store';
import { PlayerProps } from '../types';
import { parseError } from '../utils/helpers';
import { useHlsConfig } from '../utils/use-hls-config';
import { RewindIcon } from './rewind-icon';
import { SettingsMenu } from './settings';
import { VMError } from './vm-error';

const HlsPlayer: FC<PlayerProps> = ({ fullscreen, aspectRatio = '16:9', videoId, controls = true, ...rest }) => {
  const [error, setError] = useState<SerializedError | null>(null);
  const [rewindVisible, setRewindVisible] = useState(false);
  const [rewindType, setRewindType] = useState<'forward' | 'backward' | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const playerRef = useRef<HTMLVmPlayerElement | null>(null);
  const matches = useMediaQuery('(min-width: 1024px)');
  const hlsConfig = useHlsConfig();
  const { player } = videoListStore.videos.get(videoId)!;

  const refCallback = useCallback((node: HTMLVmPlayerElement) => {
    if (node !== null) {
      playerRef.current = node;
      player.setPlayerElement(node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaybackRateChange = (event: Event) => {
    const radio = event.target as HTMLVmMenuRadioElement;
    const newPlaybackRate = parseFloat(radio.value);
    setPlaybackRate(newPlaybackRate);
    if (playerRef.current) {
      playerRef.current.playbackRate = newPlaybackRate;
    }
  };

  const showRewindIcon = (type: 'forward' | 'backward') => {
    setRewindType(type);
    setRewindVisible(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setRewindVisible(false);
      setRewindType(null);
    }, 1500);
    return () => clearTimeout(timer);
  }, [rewindVisible]);

  useHotkeys('right, left, space', (e, handler) => {
    if (!handler) return;
    const keys = handler.keys?.join('') || '';
    switch (keys) {
      case 'right':
        if (playerRef.current) {
          playerRef.current.currentTime += 5;
          showRewindIcon('forward');
        }
        break;
      case 'left':
        if (playerRef.current) {
          playerRef.current.currentTime -= 5;
          showRewindIcon('backward');
        }
        break;
      case 'space':
        e.preventDefault();
        if (playerRef.current) {
          if (playerRef.current.paused) {
            playerRef.current.play();
          } else {
            playerRef.current.pause();
          }
        }
        break;
    }
  });

  const src = `https://interesnoitochka.ru/api/v1/videos/video/${videoId}/hls/playlist.m3u8`;
  const poster = `https://interesnoitochka.ru/api/v1/videos/video/${videoId}?preview=true`;

  return (
    <>
      {hlsConfig && (
        <Player
          aspectRatio={aspectRatio}
          playsinline={true}
          ref={refCallback}
          {...rest}
          onVmPlaybackReady={() => player.setIsReady()}
          onVmPausedChange={() => player.setIsPaused()}
          onVmCurrentTimeChange={(event: CustomEvent<number>) => player.setCurrentTime(event.detail)}
          onVmError={e => {
            const networkDetails = e.detail.data?.networkDetails;

            if (networkDetails?.status === 404) {
              try {
                setError(parseError(networkDetails));
              } catch {
                setError(
                  new SerializedError({
                    status: 404,
                    message: 'HLS playlist not found',
                  })
                );
              }
            }
          }}>
          <Hls poster={poster} config={hlsConfig} version='latest'>
            <source data-src={src} type='application/x-mpegURL' />
          </Hls>

          {rewindVisible && rewindType && <RewindIcon type={rewindType} />}
          <Ui>
            <ClickToPlay />
            <DblClickFullscreen />
            <SettingsMenu playbackRate={playbackRate} handlePlaybackRateChange={handlePlaybackRateChange} />
            {controls && (
              <Controls>
                <div className='w-full backdrop-brightness-75 backdrop-blur-sm p-2'>
                  <ControlGroup space='bottom'>
                    <ScrubberControl />
                  </ControlGroup>
                  <ControlGroup>
                    <PlaybackControl />
                    <TimeProgress />
                    <VolumeControl />
                    <ControlSpacer />
                    <SettingsControl />
                    <PipControl />
                    {matches && !fullscreen && (
                      <Control label={'Wide'} onClick={() => formatVideoStore.setWideFormatToggle()}>
                        <Tooltip>Wide</Tooltip>
                        <Icon type='wide-player-format' />
                      </Control>
                    )}
                    <FullscreenControl />
                  </ControlGroup>
                </div>
              </Controls>
            )}
          </Ui>
        </Player>
      )}
      <VMError error={error} />
    </>
  );
};

export default HlsPlayer;

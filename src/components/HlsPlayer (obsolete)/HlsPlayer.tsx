'use client';
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
  Video,
  VolumeControl,
} from '@vime/react';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useMediaQuery } from 'usehooks-ts';
import { formatVideoStore } from './model/format-video-player-store';
import { playerStore } from './model/player-store';
import { RewindIcon } from './ui/rewind-icon';
import { SettingsMenu } from './ui/settings';
import { VMError } from './ui/vm-error';
import { handleHlsError } from './utils/handle-hls-errors';
import { useHandlePlayback } from './utils/use-handle-playback';
import { useHlsConfig } from './utils/use-hls-config';
import { useReloadPlayer } from './utils/use-reload-player';

const HlsPlayer: FC<{ videoUrl: string; poster: string; fullscreen?: boolean }> = observer(
  ({ videoUrl, poster, fullscreen }) => {
    const [rewindVisible, setRewindVisible] = useState(false);
    const [rewindType, setRewindType] = useState<'forward' | 'backward' | null>(null);
    const [isNativeHlsSupported, setIsNativeHlsSupported] = useState<boolean | null>(null);

    const [playbackRate, setPlaybackRate] = useState(1);
    const player = useRef<HTMLVmPlayerElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const isWideformatPlayer = formatVideoStore.wideFormat;
    const matches = useMediaQuery('(min-width: 1024px)');
    const hlsConfig = useHlsConfig(player);
    const { handlePlaybackReady } = useHandlePlayback(player);

    //возможность перезагрузить плеер
    //eslint-disable-next-line
    const { videoSrc, reloadPlayer, key } = useReloadPlayer(player, videoUrl);

    const handlePlaybackRateChange = (event: Event) => {
      const radio = event.target as HTMLVmMenuRadioElement;
      const newPlaybackRate = parseFloat(radio.value);
      setPlaybackRate(newPlaybackRate);
      if (player.current) {
        player.current.playbackRate = newPlaybackRate;
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
          if (player.current) {
            player.current.currentTime += 5;
            showRewindIcon('forward');
          }
          break;
        case 'left':
          if (player.current) {
            player.current.currentTime -= 5;
            showRewindIcon('backward');
          }
          break;
        case 'space':
          e.preventDefault();
          if (player.current) {
            if (player.current.paused) {
              player.current.play();
            } else {
              player.current.pause();
            }
          }
          break;
      }
    });

    useEffect(() => {
      const video = document.createElement('video');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        setIsNativeHlsSupported(true);
      } else {
        setIsNativeHlsSupported(false);
      }
    }, []);

    useEffect(() => {
      playerStore.initialize({ videoUrl, player, container });
    }, [videoUrl]);

    return (
      <div
        ref={container}
        className={`${isWideformatPlayer ? 'w-full col-[1/7] max-w-[1900px]  justify-self-center' : 'col-[1/7] lg:col-[1/5]'} ${fullscreen ? 'fullscreen bg-black ' : ''}`}>
        {hlsConfig && isNativeHlsSupported !== null && (
          <Player
            playsinline={true}
            aspectRatio='16:9'
            ref={player}
            onError={() => {
              console.log('error');
            }}
            onVmPlaybackReady={handlePlaybackReady}>
            {!isNativeHlsSupported ? (
              <Hls
                key={key}
                poster={poster}
                config={hlsConfig}
                onVmError={e => {
                  handleHlsError(e, player);
                }}
                version='latest'>
                <source data-src={videoSrc || ''} type='application/x-mpegURL' />
              </Hls>
            ) : (
              <Video key={key} poster={poster}>
                <source data-src={videoSrc || ''} type='application/x-mpegURL' />
              </Video>
            )}
            {rewindVisible && rewindType && <RewindIcon type={rewindType} />}
            <Ui>
              <ClickToPlay />
              <DblClickFullscreen />
              <SettingsMenu playbackRate={playbackRate} handlePlaybackRateChange={handlePlaybackRateChange} />
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

              <VMError />
            </Ui>
          </Player>
        )}
      </div>
    );
  }
);

export default HlsPlayer;

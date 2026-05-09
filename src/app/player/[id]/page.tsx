'use client';
import { Controls, DefaultUi, Hls, Player, Video } from '@vime/react';

export default function PlayerPage({ params }: { params: { id: string } }) {
  const id = params.id || '15';
  const src = `https://interesnoitochka.ru/api/v1/videos/video/${id}/hls/playlist.m3u8`;
  return (
    <>
      <video controls playsInline width='360' height='640' src={src} />
      <div>
        <Player>
          <Hls version='latest'>
            <source data-src={src} type='application/x-mpegURL' />
          </Hls>
          <DefaultUi>
            <Controls fullWidth></Controls>
          </DefaultUi>
        </Player>
      </div>
      <div>
        <Player playsinline>
          <Video>
            <source data-src={src} />
          </Video>
          <DefaultUi>
            <Controls fullWidth></Controls>
          </DefaultUi>
        </Player>
        <Player playsinline>
          <Video>
            <source src={src} type='application/x-mpegURL' />
          </Video>
          <DefaultUi>
            <Controls fullWidth></Controls>
          </DefaultUi>
        </Player>
        <Player >
          <Video>
            <source src={src} type='application/x-mpegURL' />
          </Video>
          <DefaultUi>
            <Controls fullWidth></Controls>
          </DefaultUi>
        </Player>
      </div>
    </>
  );
}

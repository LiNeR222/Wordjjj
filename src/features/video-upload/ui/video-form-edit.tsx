'use client';

import { videoListStore } from '@/entities/video/model/video-list-store';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { VideoForm } from './video-form';

interface VideoFormEditProps {
  videoId: number;
}

export const VideoFormEdit: FC<VideoFormEditProps> = observer(({ videoId }) => {
  const videoStore = videoListStore.videos?.get(videoId);

  useEffect(() => {
    if (!videoStore) {
      videoListStore.fetchVideoById(videoId);
    }
  }, [videoStore, videoId]);

  if (!videoStore?.video) {
    return <div>Loading...</div>;
  }

  return <VideoForm video={videoStore.video} />;
});

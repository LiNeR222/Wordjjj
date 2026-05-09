import { PlayerStore } from '@/entities/video/model/player-store';
import { videoListStore } from '@/entities/video/model/video-list-store';
import { useObserver } from 'mobx-react-lite';
import { useEffect } from 'react';

export const useGetPlayer = (videoId: number): PlayerStore | null => {
  const videoStore = useObserver(() => videoListStore.videos.get(videoId));

  useEffect(() => {
    if (!videoStore) {
      videoListStore.fetchVideoById(videoId);
    }
  }, [videoId, videoStore]);

  return videoStore?.player ?? null;
};

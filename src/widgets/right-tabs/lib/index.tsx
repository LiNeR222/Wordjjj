import { VideoChat } from '@/components/pages/video/chat';
import { VideoCollections } from '@/components/pages/video/collection';
import { TTabs } from '../types/';

export const getTabElement = (tab: TTabs, currentVideoId?: number) => {
  switch (tab) {
    case 'videos':
      return <VideoCollections currentVideoId={currentVideoId} />;
    case 'chat':
      return <VideoChat />;
    default:
      return <VideoCollections currentVideoId={currentVideoId} />;
  }
};

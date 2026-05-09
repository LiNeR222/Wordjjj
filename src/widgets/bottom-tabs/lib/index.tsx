import { VideoComments } from '@/features/video-comments';
import { VideoUsers } from '@/components/pages/video/users';
import { TTabs } from '../types';

export const getTabElement = (tab: TTabs, videoId: number) => {
  switch (tab) {
    case 'comments':
      return <VideoComments videoId={videoId} />;
    case 'users':
      return <VideoUsers />;
    default:
      return <VideoComments videoId={videoId} />;
  }
};

import { BottomTabs } from '@/widgets/bottom-tabs/ui/bottom-tabs';
import { RightTabs } from '@/widgets/right-tabs/ui/right-tabs';
import { FC } from 'react';

export const VideoPage: FC<{ videoId: number, showRecommendations?: boolean }> = ({ videoId, showRecommendations = true }) => {
  return (
    <>
      {showRecommendations && <RightTabs videoId={videoId} />}
      <BottomTabs videoId={videoId} />
    </>
  );
};

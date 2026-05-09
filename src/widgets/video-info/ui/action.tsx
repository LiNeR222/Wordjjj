import { VideoDetailed } from '@/entities/video/types';
import { FC } from 'react';
import styles from './actions.module.css';
import { Likes } from './likes';
import { ShareAction } from './share';

interface VideoInfoActionsProps {
  video: VideoDetailed;
}

export const VideoInfoActions: FC<VideoInfoActionsProps> = ({ video }) => {
  return (
    <div className={styles.actions}>
      <div className={styles.actionPill}>
        <ShareAction />
      </div>
      <Likes videoId={video.video_id} />
      {/* <Tooltip content='Download'>
        <div className='p-1'>
          <GoDownload fontSize={20} />
        </div>
      </Tooltip>
      <Tooltip content='Actions'>
        <div className='p-1'>
          <PiDotsThreeOutlineLight fontSize={20} />
        </div>
      </Tooltip> */}
    </div>
  );
};

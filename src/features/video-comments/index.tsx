import { FC } from 'react';
import { AddComment } from '../../entities/comment/ui/add-comment';
import { CommentsList } from './ui/comments-list';

interface VideoCommentsProps {
  videoId: number;
}

export const VideoComments: FC<VideoCommentsProps> = ({ videoId }) => {
  return (
    <div className='flex-1 flex flex-col gap-2'>
      <AddComment videoId={videoId} />
      <CommentsList videoId={videoId} />
    </div>
  );
};

export default VideoComments;

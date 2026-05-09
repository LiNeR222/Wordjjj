import { fetchLikes } from '@/entities/like/api/server';
import { LikeGroup } from '@/features/like-group';
import { FC } from 'react';

interface LikesProps {
  videoId: number;
}

export const Likes: FC<LikesProps> = async ({ videoId }) => {
  const { data: videoLikes, error } = await fetchLikes(videoId);
  if (error || !videoLikes) return null;

  // initialLikes - лайки, полученные и отрисованные на сервере.
  return <LikeGroup videoId={videoId} initialLikes={videoLikes} />;
};

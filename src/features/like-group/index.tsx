'use client';
import { likeListStore } from '@/entities/like/model/likeListStore';
import { VideoLikes } from '@/entities/like/types';
import { FC, useEffect } from 'react';
import { LikeButtonGroup } from './ui/like-button-group';

interface LikeGroupProps {
  videoId: number;
  initialLikes: VideoLikes;
}

export const LikeGroup: FC<LikeGroupProps> = ({ videoId, initialLikes }) => {
  const { addLike } = likeListStore;

  useEffect(() => {
    addLike(videoId, initialLikes);
  }, [initialLikes, addLike, videoId]);

  return <LikeButtonGroup initialLikes={initialLikes} videoId={videoId} />;
};

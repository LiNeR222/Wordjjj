'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { Icon } from '@/shared/ui/icon';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useState } from 'react';
import { likeListStore } from '../model/likeListStore';
import { VideoLikes } from '../types';
import styles from './like-button.module.css';

interface LikeButtonProps {
  type: 'like' | 'dislike';
  initialLikes: VideoLikes;
  videoId: number;
}

export const LikeButton: FC<LikeButtonProps> = observer(({ type, initialLikes, videoId }) => {
  const like = likeListStore.likes?.[videoId];
  const { count_likes, count_dislikes, status } = like || initialLikes;
  const isActive = status === type;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!isPressed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsPressed(false);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [isPressed]);

  const handlePutLike = async () => {
    if (!authStore.isAuth) {
      const result = await authStore.signIn();
      if (!result) return;
    }

    setIsPressed(true);
    like?.putLike(type);
  };

  return (
    <button
      onClick={handlePutLike}
      className={clsx(styles.button, isPressed && styles.pressed, {
        [styles.activeLike]: isActive && type === 'like',
        [styles.activeDislike]: isActive && type === 'dislike',
      })}>
      <Icon className={clsx('text-xl', styles.icon)} type={isActive ? `${type}-fill` : type} />
      <span className={styles.count}>{type === 'like' ? count_likes : count_dislikes}</span>
    </button>
  );
});

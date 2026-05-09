import { UserProfile } from '@/entities/user/types';
import { useMemo } from 'react';
import { VideoComment } from '../types';

export const useCheckCurrentUser = (comment: VideoComment, user?: UserProfile) => {

  const isSameUser = comment.user_id === user?.id;
  const avatar = useMemo(
    () => (isSameUser ? user?.profile_picture : comment.user_avatar),
    [comment.user_avatar, isSameUser, user?.profile_picture]
  );
  const userName = useMemo(
    () => (isSameUser ? user?.name : comment.user_name),
    [comment.user_name, isSameUser, user?.name]
  );

  return { avatar, userName };
};

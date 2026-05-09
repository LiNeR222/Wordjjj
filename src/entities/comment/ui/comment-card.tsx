'use client';

//import { tokenStore } from '@/entities/token/model';
import { authStore } from '@/entities/auth/model/authStore';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { UserAvatar } from '../../user/ui/user-avatar';
import { CommentStoreContext } from '../lib/context';
import { useCheckCurrentUser } from '../lib/use-check-current-user';
import { CommentStore } from '../model/comment-store';
import { CommentActions } from './comment-action';
import { CommentDeleted } from './comment-deleted';
import { CommentEdit } from './comment-edit';
import { CommentMessage } from './comment-message';
import { CommentReply } from './comment-reply';
import { CommentResponded } from './comment-responded';
import { TimeAgo } from './time-ago';

interface CommentCardProps {
  comment: CommentStore;
}

export const CommentCard: FC<CommentCardProps> = observer(({ comment: commentStore }) => {
  const { date_publication } = commentStore.instance;

  const { avatar, userName } = useCheckCurrentUser(commentStore.comment, authStore.user);

  return (
    <CommentStoreContext.Provider value={commentStore}>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <UserAvatar src={avatar} userName={userName} className='!rounded-lg' />
          <div className='font-semibold text-sm'>{userName}</div>
          <div className='flex items-center gap-2'>
            <TimeAgo date={date_publication} />
            <CommentActions />
          </div>
        </div>

        <div className='p-2 pl-8'>
          <CommentEdit />
          <CommentDeleted />
          <CommentMessage />
          <CommentResponded />
        </div>
        <CommentReply />
      </div>
    </CommentStoreContext.Provider>
  );
});

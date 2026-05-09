'use client';

import { Button, TextArea } from '@/components/ui';
import { authStore } from '@/entities/auth/model/authStore';
import { UserAvatarMemo } from '@/entities/user/ui/user-avatar';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { FC, useState } from 'react';
import { commentsListStore } from '../model/comments-list-store';
import styles from './add-comment.module.css';

interface AddCommentProps {
  videoId: number;
  responseCommentId?: number;
  onBlur?: () => void;
  autoFocus?: boolean;
}

export const AddComment: FC<AddCommentProps> = observer(({ videoId, responseCommentId, onBlur, autoFocus = false }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const comment = {
      video_id: videoId,
      message: value,
      ...(responseCommentId ? { response_comment: responseCommentId } : {}),
    };
    commentsListStore.addComment(videoId, comment);
    setValue('');
    setFocused(false);
    onBlur?.();
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      if (value.trim()) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };
  const { user } = authStore;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <UserAvatarMemo src={user?.profile_picture} userName={user?.name} size={38} />
        <TextArea
          autoFocus={autoFocus}
          placeholder='Напишите ваш комментарий'
          className={clsx('w-full', styles.textarea)}
          rows={1}
          style={{ height: focused ? 112 : 40 }}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (!value.trim()) {
              setFocused(false);
              onBlur?.();
            }
          }}
          onKeyDown={handleKeyDown}
          value={value}
        />
      </div>
      <div className={clsx(styles.actions, focused && styles.actionsVisible)}>
        <Button className={styles.submitButton} variant='dark' type='submit'>
          Отправить
        </Button>
      </div>
    </form>
  );
});

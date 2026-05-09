import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useCommentStore } from '../lib/context';
import { AddComment } from './add-comment';
import { ReplyButton } from './reply-button';

export const CommentReply = observer(() => {
  const commentStore = useCommentStore();
  if (!commentStore) return null;
  const {
    isDeleted,
    instance: { id },
  } = commentStore;
  const [reply, setReply] = useState(false);

  if (isDeleted) return null;

  return (
    <div className='pl-8'>
      {reply ? (
        <AddComment videoId={commentStore.videoId} responseCommentId={id} onBlur={() => setReply(false)} autoFocus />
      ) : (
        <ReplyButton onReply={() => setReply(true)} />
      )}
    </div>
  );
});

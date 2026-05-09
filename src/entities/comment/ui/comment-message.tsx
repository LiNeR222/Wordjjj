import { observer } from 'mobx-react-lite';
import { useCommentStore } from '../lib/context';
import { ResponseComment } from './response-comment';

export const CommentMessage = observer(() => {
  const commentStore = useCommentStore();
  if (!commentStore) return null;
  const {
    isDeleted,
    edit,
    instance: { message },
  } = commentStore;
  if (isDeleted || edit) return null;
  return (
    <p className='m-0'>
      {message}
      <ResponseComment />
    </p>
  );
});

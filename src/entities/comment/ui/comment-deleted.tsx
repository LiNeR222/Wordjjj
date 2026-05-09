import { observer } from 'mobx-react-lite';
import { useCommentStore } from '../lib/context';

export const CommentDeleted = observer(() => {
  const commentStore = useCommentStore();
  const { state_comment } = commentStore?.instance || {};
  if (state_comment === 'publication') return null;
  return (
    <span className='text-gray-400 text-sm opacity-50 font-italic font-light'>
      {state_comment === 'delete_user' ? 'Комментарий удален пользователем' : 'Комментарий удален модератором'}
    </span>
  );
});

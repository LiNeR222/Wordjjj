import { observer } from 'mobx-react-lite';
import { useCommentStore } from '../lib/context';

export const CommentResponded = observer(() => {
  const commentStore = useCommentStore();
  const { respondedComment, loading, error, respondedCommentVisible } = commentStore || {};

  if (!respondedCommentVisible) return null;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className='pt-2 pl-4 text-gray-500 text-sm opacity-50 font-light'>
      {respondedComment?.instance.state_comment.startsWith('delete')
        ? 'Комментарий удален'
        : 're: ' + respondedComment?.instance.message}
    </div>
  );
});

import { Icon } from '@/shared/ui/icon';
import { observer } from 'mobx-react-lite';
import { useCommentStore } from '../lib/context';


export const CommentActions = observer(() => {
  const commentStore = useCommentStore();
  if (!commentStore) return null;
  const { isOwner, isDeleted, edit, startEdit, finishEdit, deleteComment } = commentStore;
  if (!isOwner || isDeleted) return null;
  return (
    <div className='flex items-center text-base'>
      <button className='hover:bg-gray-300 rounded-lg p-1' onClick={() => (edit ? finishEdit() : startEdit())}>
        <Icon type='edit' />
      </button>
      <button className='hover:bg-gray-200 rounded-lg p-1' onClick={deleteComment}>
        <Icon type='delete' />
      </button>
    </div>
  );
});

import { TextArea } from '@/components/ui';
import { Icon } from '@/shared/ui';
import { observer } from 'mobx-react-lite';
import { useCommentStore } from '../lib/context';

export const CommentEdit = observer(() => {
  const commentStore = useCommentStore();
  if (!commentStore) return null;
  const { isOwner, edit, editMessage, setEditMessage, finishEdit, saveChanges } = commentStore;
  if (!isOwner || !edit) return null;

  const handleSave = () => {
    saveChanges();
    finishEdit();
  };

  return (
    <div className='relative flex items-center gap-2'>
      <TextArea
        autoFocus
        className='w-full'
        rows={4}
        value={editMessage}
        onChange={e => setEditMessage(e.target.value)}
        onBlur={() => {
          finishEdit();
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
        }}
      />
      <button
        className='absolute opacity-60 text-xl right-2 bottom-2 z-40 bg-gray-150 hover:bg-gray-300 rounded-lg p-1'
        onMouseDown={handleSave}>
        <Icon type='enter' className='text-xl' />
      </button>
    </div>
  );
});

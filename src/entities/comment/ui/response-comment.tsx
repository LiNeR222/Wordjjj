import { useCommentStore } from '../lib/context';

export const ResponseComment = () => {
  const commentStore = useCommentStore();
  const { response_comment } = commentStore?.instance || {};
  if (!response_comment) return null;
  return (
    <button
      className='pl-4 text-gray-400 text-sm opacity-50 font-italic font-light'
      onClick={() => commentStore?.toggleRespondedComment()}>
      в ответ на комментарий: <span className='cursor-pointer underline'>#{response_comment}</span>
    </button>
  );
};

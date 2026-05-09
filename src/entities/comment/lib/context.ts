import { createContext, useContext } from 'react';
import { CommentStore } from '../model/comment-store';

export const CommentStoreContext = createContext<CommentStore | null>(null);

export const useCommentStore = () => {
  return useContext(CommentStoreContext);
};

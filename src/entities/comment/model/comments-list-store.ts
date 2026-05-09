import { makeAutoObservable, runInAction } from 'mobx';
import { commentApi } from '../api';
import { CommentCreate, CommentsCollection } from '../types';
import { CommentStore } from './comment-store';
import { commentsPerPage } from './constants';

class CommentsListStore {
  comments: { [key: number]: CommentsCollection } = {};
  error: string | null = null;
  loading: boolean = false;
  constructor() {
    makeAutoObservable(this);
  }
  addComment = async (videoId: number, comment: CommentCreate) => {
    this.loading = true;
    try {
      const collection = this.comments[videoId] ?? { list: [], count_comments: 0 };
      const newComment = await commentApi.createComment(videoId, comment);

      runInAction(() => {
        collection.list.unshift(new CommentStore(videoId, newComment));
        collection.count_comments = collection.count_comments + 1;
        this.comments[videoId] = collection;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.error = `Ошибка при добавлении комментария. (${JSON.stringify(error)})`;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };
  deleteComment = (videoId: number, commentId: number) => {
    runInAction(() => {
      const collection = this.comments[videoId];
      collection.list = collection.list.filter(comment => comment.instance.id !== commentId);
      collection.count_comments = collection.count_comments - 1;
    });
  };
  fetchMoreComments = async (videoId: number): Promise<void> => {
    let collection = this.comments[videoId];

    if (collection && collection.list.length >= collection.count_comments) {
      return;
    }

    collection ??= { list: [], count_comments: 0 };
    this.loading = true;

    try {
      const response = await commentApi.getComments(videoId, {
        offset: collection.list.length,
        limit: commentsPerPage,
      });

      runInAction(() => {
        if (response && response?.comments?.length) {
          collection.list = [
            ...collection.list,
            ...response.comments.map(comment => new CommentStore(videoId, comment)),
          ];
          collection.count_comments = response.count_comments;
        }
        this.comments[videoId] = collection;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.error = `Ошибка при загрузке комментариев для видео ${videoId}. (${JSON.stringify(error)})`;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };
}

export const commentsListStore = new CommentsListStore();

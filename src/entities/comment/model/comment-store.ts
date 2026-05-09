import { SerializedError } from '@/shared/lib/serialized-error';
import { makeAutoObservable, runInAction } from 'mobx';
import { commentApi } from '../api';
import { VideoComment } from '../types';
import { commentsListStore } from './comments-list-store';
import { authStore } from '@/entities/auth/model/authStore';

export class CommentStore {
  instance: VideoComment = {} as VideoComment;
  videoId!: number;
  initialized = false;
  loading: boolean = false;
  edit: boolean = false;
  editMessage: string = '';
  error: SerializedError | null = null;
  respondedComment: CommentStore | null = null;
  respondedCommentVisible: boolean = false;
  constructor(videoId: number, comment: VideoComment) {
    makeAutoObservable(this);
    runInAction(() => {
      this.videoId = videoId;
      Object.assign(this.instance, comment);
    });
  }
  deleteComment = async () => {
    this.loading = true;
    try {
      const response = await commentApi.deleteComment(this.instance.id);
      if (response && response.state_comment) {
        runInAction(() => {
          this.instance.state_comment = response.state_comment;
          this.instance.message = '';
        });
      } else if (response === null) {
        commentsListStore.deleteComment(this.videoId, this.instance.id);
      }
    } catch (error) {
      runInAction(() => {
        this.error = error as SerializedError;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };
  startEdit = () => {
    runInAction(() => {
      this.edit = true;
      this.editMessage = this.instance.message;
    });
  };
  setEditMessage = (message: string) => {
    runInAction(() => {
      this.editMessage = message;
    });
  };

  finishEdit = () => {
    runInAction(() => {
      this.edit = false;
    });
  };

  saveChanges = async () => {
    this.loading = true;
    try {
      const response = await commentApi.editComment(this.instance.id, this.editMessage);
      if (response) {
        runInAction(() => {
          this.editMessage = '';
          this.instance.message = response.message;
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = error as SerializedError;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  fetchRespondedComment = async () => {
    if (!this.instance.response_comment) return;
    try {
      this.loading = true;
      const response = await commentApi.getComment(this.instance.response_comment);
      if (response) {
        runInAction(() => {
          this.respondedComment = new CommentStore(this.videoId, response);
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = new SerializedError({
          message: `Failed to load the responded comment: ${JSON.stringify(error)}`,
        });
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  toggleRespondedComment = async () => {
    if (!this.instance.response_comment) return;
    if (!this.respondedComment) {
      await this.fetchRespondedComment();
    }
    runInAction(() => {
      this.respondedCommentVisible = !this.respondedCommentVisible;
    });
  };

  get isOwner() {
    return authStore?.user?.id === this.instance.user_id;
  }

  get isDeleted() {
    return this.instance.state_comment !== 'publication';
  }

  get comment() {
    return this.instance;
  }
}

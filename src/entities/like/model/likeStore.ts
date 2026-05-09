import { SerializedError } from '@/shared/lib/serialized-error';
import { makeAutoObservable } from 'mobx';
import { likeApi } from '../api';
import { LikeStatus, VideoLikes } from '../types';

//TODO: добавить реакцию на изменение токена
export class LikeStore {
  videoId: number | null = null;
  count_dislikes = 0;
  count_likes = 0;
  initialized = false;
  status: LikeStatus = 'null';
  loading: boolean = false;
  error: SerializedError | null = null;
  constructor(videoId: number, initialLikes: VideoLikes) {
    makeAutoObservable(this);
    this.videoId = videoId;
    this.setLikeState(initialLikes);
  }
  setLikeState = (initialLikes: VideoLikes) => {
    this.count_dislikes = initialLikes.count_dislikes;
    this.count_likes = initialLikes.count_likes;
    this.status = initialLikes.status;
    this.initialized = true;
  };

  private changeLikeCount([likeChange, dislikeChange]: [number, number]) {
    this.count_likes += likeChange;
    this.count_dislikes += dislikeChange;
  }

  fetchLike = async () => {
    if (!this.videoId) return;
    const likes = await likeApi.getLikes(this.videoId);
    this.setLikeState(likes);
  };

  putLike = async (type: LikeStatus) => {
    if (!this.videoId) return;

    if (this.status === 'null') {
      //лайк и дизлайк не установлены
      this.changeLikeCount(type === 'like' ? [1, 0] : [0, 1]);
      this.status = type;
    } else {
      if (this.status === type) {
        //клик на уже установленный лайк или дизлайк
        this.changeLikeCount(type === 'like' ? [-1, 0] : [0, -1]);
        this.status = 'null';
      } else {
        //клик на противоположный лайк или дизлайк
        this.changeLikeCount(type === 'like' ? [1, -1] : [-1, 1]);
        this.status = type;
      }
    }

    try {
      this.loading = true;
      const result = await likeApi.putLike({ videoId: this.videoId, status: this.status });
      this.setLikeState(result);
    } catch (error) {
      this.error = error as SerializedError;
    } finally {
      this.loading = false;
    }
  };
}

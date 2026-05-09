import { makeAutoObservable, runInAction } from 'mobx';
import { likeApi } from '../api';
import { VideoLikes } from '../types';
import { LikeStore } from './likeStore';

class LikeListStore {
  likes: { [key: string]: LikeStore } = {};
  constructor() {
    makeAutoObservable(this);
  }
  addLike = (videoId: number, videoLikes: VideoLikes) => {
    runInAction(() => {
      this.likes[videoId] = new LikeStore(videoId, videoLikes);
    });
  };
  getLikeByVideoId = async (videoId: number): Promise<LikeStore | null> => {
    if (this.likes[videoId]) {
      return this.likes[videoId];
    }

    try {
      const videoLikes = await likeApi.getLikes(videoId);

      if (!videoLikes) {
        throw new Error(`Likes for video with ID ${videoId} not found.`);
      }
      runInAction(() => {
        this.likes[videoId] = new LikeStore(videoId, videoLikes);
      });
    } catch (error) {
      console.error(`Error fetching likes for video with ID ${videoId}:`, error);
      return null;
    } finally {
      return this.likes[videoId];
    }
  };
}

export const likeListStore = new LikeListStore();

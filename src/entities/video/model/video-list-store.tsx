import { isServer } from '@/shared/config';
import { SerializedError } from '@/shared/lib/serialized-error';
import { withErrorAndLoading } from '@/shared/lib/withErrorAndLoading';
import { makeAutoObservable, runInAction } from 'mobx';
import { videoApi } from '../api';
import { ICreateVideoData, Recommendations, VideoDetailed, VideoRecommendationsQuery } from '../types';
import { VideoStore } from './video-store';

export class VideoListStore {
  videos: Map<number, VideoStore> = new Map();
  loading: boolean = false;
  error: SerializedError | null = null;
  constructor() {
    makeAutoObservable(this);
  }
  fetchVideoById = async (videoId: number) => {
    try {
      if (!this.videos.has(videoId)) {
        const video = await this.getVideo(videoId);
        if (video) {
          runInAction(() => {
            this.videos.set(video.video_id, new VideoStore(video));
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  addVideo = (video: VideoDetailed) => {
    runInAction(() => {
      this.videos.set(video.video_id, new VideoStore(video));
    });
  };
  getVideo = async (id: number): Promise<VideoDetailed> => videoApi.getDetailedVideo(id);
  checkVideo = async (id: number): Promise<boolean> => {
    try {
      await videoApi.checkVideo(id);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
  createVideo = async (data: ICreateVideoData): Promise<VideoDetailed> => {
    try {
      const res = await videoApi.createVideo(data);
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  getRecommendations = async (data: VideoRecommendationsQuery): Promise<Recommendations> => {
    try {
      const res = await videoApi.getRecommendations(data);
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  deleteVideo = async (id: number): Promise<boolean> => {
    const result = await withErrorAndLoading(this, () => videoApi.deleteVideo(id));
    if (result) {
      this.videos.delete(id);
      return true;
    }
    return false;
  };
  //ToDo делать через VideoStore, как videoStore.update()
  updateVideo = (video: VideoDetailed) => {
    this.videos.set(video.video_id, new VideoStore(video));
  };
}

export const videoListStore = isServer ? ({ videos: new Map() } as VideoListStore) : new VideoListStore();

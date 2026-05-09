import { authStore } from '@/entities/auth/model/authStore';
import { isServer } from '@/shared/config';
import { SerializedError } from '@/shared/lib/serialized-error';
import { withErrorAndLoading } from '@/shared/lib/withErrorAndLoading';
import { message } from '@/shared/ui/message';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { videoApi } from '../api';
import { MyVideo, MyVideoList, VideoDetailed } from '../types';
import { myVideoPerPage } from './constants';
import { videoListStore } from './video-list-store';

class MyVideoStore {
  instance: MyVideoList | null = null;
  page: number | null = null;
  filter: { [key: string]: string } | null = null;
  error: SerializedError | null = null;
  loading: boolean = false;
  initialized: boolean = false;
  private isInitialQuery = true;

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => [this.filter, this.page],
      () => {
        if (this.isInitialQuery) {
          this.isInitialQuery = false;
          if (this.instance) return;
        }
        this.fetchMyVideo();
      }
    );

    reaction(
      () => authStore.isAuth,
      isAuth => {
        if (!isAuth) {
          runInAction(() => {
            this.instance = null;
          });
        }
      }
    );
  }
  setPage = (page: number) => {
    this.page = page;
  };

  addVideo = (video: VideoDetailed) => {
    if (!this.instance) {
      this.instance = {
        total: 1,
        offset: 0,
        limit: 10,
        count: 1,
        filter: {
          user_id: 0,
        },
        items: [video as unknown as MyVideo],
      };
    } else {
      const existingVideo = this.instance.items.find(item => item.video_id === video.video_id);
      if (existingVideo) {
        this.updateVideo(video);
      } else {
        this.instance.items = [video as unknown as MyVideo, ...this.instance.items];
        this.instance.total += 1;
      }
    }
  };

  fetchMyVideo = async () => {
    const result = await withErrorAndLoading(this, () => videoApi.getMyVideos(this.page ?? 1));

    if (result) {
      runInAction(() => {
        this.instance = result;
      });
    }
  };
  //ToDo делать через VideoStore как videoStore.update()
  updateVideo = <T extends { video_id: number }>(video: T) => {
    if (!this.instance) return;
    const index = this.instance.items.findIndex(item => item.video_id === video.video_id);
    if (index !== -1) {
      this.instance.items[index] = {
        ...this.instance.items[index],
        ...video,
      };
    }
  };

  deleteVideo = async (id: number) => {
    const result = await videoListStore.deleteVideo(id);
    if (!result) {
      message.error('Ошибка удаления видео. Попробуйте позже');
      return;
    }
    if (this.instance?.items) {
      this.instance.items = [...this.instance.items.filter(item => item.video_id !== id)];
      this.instance.total -= 1;
    }
    message.success('Видео удалено');
  };

  get items() {
    return this.instance?.items || [];
  }

  get total() {
    return this.instance?.total || 0;
  }

  get totalPages() {
    return this.total ? Math.ceil(this.total / myVideoPerPage) : 1;
  }
}

export const myVideoStore = isServer ? ({} as MyVideoStore) : new MyVideoStore();

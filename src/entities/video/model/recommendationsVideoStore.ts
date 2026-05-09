import { Recommendations, Video, VideoDetailed, VideoRecommendationsQuery } from '@/entities/video/types';
import { SerializedError } from '@/shared/lib/serialized-error';
import { withErrorAndLoading } from '@/shared/lib/withErrorAndLoading';
import { debounce, isEqual } from 'lodash';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { videoApi } from '../api';
import { videoListStore } from './video-list-store';

export class RecommendationsVideoStore {
  instance: Recommendations | null = null;
  initialized = false;
  loading = false;
  error: SerializedError | null = null;
  items: Video[] = [];
  //параметры по умолчанию: category, offset
  presetQuery: Partial<VideoRecommendationsQuery>;
  query: VideoRecommendationsQuery | null = null;
  private isQueryReactionInitial = true;

  constructor(query: VideoRecommendationsQuery) {
    this.presetQuery = query;
    makeAutoObservable(this);

    reaction(
      () => this.instance,
      instance => {
        if (instance) {
          this.items = [...this.items, ...instance.items];
        }
      }
    );

    reaction(
      () => this.query,
      () => {
        if (this.isQueryReactionInitial) {
          this.isQueryReactionInitial = false;
          return;
        }

        runInAction(() => {
          this.items = [];
          this.loadMore();
        });
      }
    );
  }

  //initialize with ssr data or fetch first page
  initialize = async (initialData?: Recommendations) => {
    //if (this.initialized) return;
    if (initialData) {
      runInAction(() => {
        this.items = [];
        this.initialized = true;
        this.instance = initialData || null;
      });
    } else {
      runInAction(() => {
        this.items = [];
        this.initialized = true;
        this.loadMore();
      });
    }
  };

  //стрелочная функция гарантирует что this будет ссылаться на текущий экземпляр класса
  loadMore = debounce(async (limit?: number, fromId?: number) => {
    if (this.loading) {
      return;
    }
    const result = await withErrorAndLoading(this, () =>
      videoApi.getRecommendations({
        ...this.presetQuery,
        ...this.query,
        ...(limit && { limit }),
        ...(fromId && { start_from_video_id: fromId }),
        offset: this.items.length,
      })
    );

    if (result) {
      runInAction(() => {
        this.instance = result;
      });
    }
  }, 100);

  updateQuery = (query: VideoRecommendationsQuery) => {
    //если выбрана категория, не соответствующая категории Хранилища пропускаем обновление
    if (query.category && query.category !== this.presetQuery.category) return;
    if (isEqual(this.query, query)) return;
    runInAction(() => {
      this.query = query;
    });
  };

  insertVideo = (video: Video) => {
    runInAction(() => {
      this.items = [video, ...this.items];
      videoListStore.addVideo(video as unknown as VideoDetailed);
    });
  };

  get total() {
    return this.instance?.total || 0;
  }

  get hasMore() {
    if (!this.instance) return false;
    return this.instance.offset + this.instance.count < this.instance.total;
  }
}

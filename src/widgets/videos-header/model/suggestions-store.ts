import { videoApi } from '@/entities/video/api';
import { Suggestions } from '@/entities/video/types';
import { SerializedError } from '@/shared/lib/serialized-error';
import { withErrorAndLoading } from '@/shared/lib/withErrorAndLoading';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { videoHeaderStore, VideoHeaderStore } from './video-header-store';

export class SuggestionsStore {
  instance: Suggestions | null = null;
  loading = false;
  error: SerializedError | null = null;
  private videoHeaderStore: VideoHeaderStore;
  constructor(videoHeaderStore: VideoHeaderStore) {
    makeAutoObservable(this);
    this.videoHeaderStore = videoHeaderStore;
    reaction(
      () => this.videoHeaderStore.searchValue,
      searchValue => {
        if (searchValue) {
          this.askSuggestions(searchValue);
        } else {
          runInAction(() => {
            this.instance = null;
          });
        }
      }
    );
  }

  askSuggestions = async (query: string) => {
    const response = await withErrorAndLoading(this, () => videoApi.getSuggestions(query));
    if (response) {
      runInAction(() => {
        this.instance = response;
      });
    }
  };

  get suggestions() {
    return this.instance?.suggestions || [];
  }

  get searchValue() {
    return this.videoHeaderStore.searchValue;
  }

  get isSearchFocused() {
    return this.videoHeaderStore.isSearchFocused;
  }
}

export const suggestionsStore = new SuggestionsStore(videoHeaderStore);

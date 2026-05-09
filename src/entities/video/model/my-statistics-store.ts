import { isServer } from '@/shared/config';
import { SerializedError } from '@/shared/lib/serialized-error';
import { withErrorAndLoading } from '@/shared/lib/withErrorAndLoading';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { videoApi } from '../api';
import { Statistics } from '../types';
import { authStore } from '@/entities/auth/model/authStore';

class MyStatisticsStore {
  instance: Statistics | null = null;
  error: SerializedError | null = null;
  loading: boolean = false;

  constructor() {
    makeAutoObservable(this);

    reaction(() => authStore.isAuth, (isAuth) => {
      if (!isAuth) {
        runInAction(() => {
          this.instance = null;
        });
      }
    });
  }

  //initialize with ssr data
  initialize = async (initialData?: Statistics) => {
    runInAction(() => {
      this.instance = initialData || null;
    });
  };

  fetchMyStatistics = async () => {
    const result = await withErrorAndLoading(this, () => videoApi.getMyStatistics());

    if (result) {
      runInAction(() => {
        this.instance = result;
      });
    }
  };

  get statistics() {
    return this.instance;
  }
}

export const myStatisticsStore = isServer ? ({} as MyStatisticsStore) : new MyStatisticsStore();

import { makeAutoObservable, runInAction } from 'mobx';
import { channelApi } from '../api';
import { Subscription } from '../types';
import { withErrorAndLoading } from '@/shared/lib/withErrorAndLoading';
import { SerializedError } from '@/shared/lib/serialized-error';

export class SubscriptionStore {
  instance: Subscription | null = null;
  loading: boolean = false;
  error: SerializedError | null = null;
  channelId: number;
  constructor(channelId: number) {
    makeAutoObservable(this);
    this.channelId = channelId;
  }

  fetchSubscription = async () => {
    const result = await withErrorAndLoading(this, () => channelApi.getSubscription(this.channelId));
    if (result) {
      runInAction(() => {
        this.instance = result;
      });
    }
  };

  subscribe = async () => {
    const result = await withErrorAndLoading(this, () => channelApi.subscribe(this.channelId, {
      notifications: true,
    }));
    if (result) {
      runInAction(() => {
        this.instance = { ...this.instance!, subscription: result.status === 'subscribed', notifications: true };
      });
    }
  };

  unsubscribe = async () => {
    const result = await withErrorAndLoading(this, () => channelApi.unsubscribe(this.channelId));
    if (result) {
      runInAction(() => {
        this.instance = { ...this.instance!, subscription: false, notifications: false };
      });
    }
  };

  unMuteSubscription = async () => {
    const result = await withErrorAndLoading(this, () => channelApi.subscribe(this.channelId, {
      notifications: true,
    }));
    if (result) {
      runInAction(() => {
        this.instance = { ...this.instance!, subscription: result.status === 'subscribed', notifications: true };
      });
    }
  };

  muteSubscription = async () => {
    const result = await withErrorAndLoading(this, () => channelApi.subscribe(this.channelId, {
      notifications: false,
    }));
    if (result) {
      runInAction(() => {
        this.instance = { ...this.instance!, subscription: result.status === 'subscribed', notifications: false };
      });
    }
  };

  get subscription() {
    return this.instance;
  }

  get isSubscribed() {
    return this.subscription?.subscription;
  }

  get isMuted() {
    return !this.subscription?.notifications;
  }
}

import { makeAutoObservable } from 'mobx';
import { Channel } from '../types';
import { SubscriptionStore } from './subscription-store';

export class ChannelStore {
  instance: Channel | null = null;
  currentUserSubscription: SubscriptionStore | null = null;
  constructor(channel: Channel) {
    makeAutoObservable(this);

    this.instance = channel;
    this.currentUserSubscription = new SubscriptionStore(channel.id);
  }

  get subscription() {
    return this.currentUserSubscription;
  }
}

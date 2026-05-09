import { makeAutoObservable } from 'mobx';
import { ChannelStore } from './channel-store';

export class ChannelsListStore {
  channels: { [key: number]: ChannelStore } = {};
  constructor() {
    makeAutoObservable(this);
  }
  fetchChannelById = async (channelId: number) => {
    //TODO: добавить загрузку канала, когда появится ручка Api, в пока просто создаем канал
    const channel = new ChannelStore({ id: channelId });
    this.channels[channelId] = channel;
  };
}

export const channelsListStore = new ChannelsListStore();

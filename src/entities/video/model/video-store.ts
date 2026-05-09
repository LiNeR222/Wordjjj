import { apiUrl } from '@/shared/config';
import { makeAutoObservable } from 'mobx';
import { VideoDetailed } from '../types';
import { PlayerStore } from './player-store';

export class VideoStore {
  instance: VideoDetailed | null = null;
  player: PlayerStore;
  constructor(video: VideoDetailed) {
    makeAutoObservable(this);
    this.instance = video;
    this.player = new PlayerStore();
  }

  setPlayer = (player: HTMLVmPlayerElement | HTMLVideoElement) => {
    this.player.setPlayerElement(player);
  };

  clearPlayer = () => {
    this.player.clear();
  };

  get video() {
    return this.instance;
  }

  get id() {
    return this.instance?.video_id;
  }

  get poster() {
    if (!this.id) return '';
    return `${apiUrl}/videos/video/${this.id}?preview=true`;
  }

  get src() {
    if (!this.id) return '';
    return `${apiUrl}/videos/video/${this.id}/hls/playlist.m3u8`;
  }
}

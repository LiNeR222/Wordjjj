import { makeAutoObservable, runInAction, toJS, when } from 'mobx';
import { PlayerElement } from '../types';

export class PlayerStore {
  key = 0;
  currentTime = 0;
  isInteracted = false;
  isSettled = false;
  isReady = false;
  isPaused: boolean | null = null;
  duration = 0;
  playerElement: PlayerElement | null = null;
  constructor() {
    makeAutoObservable(this);
    when(
      () => this.isReady,
      () => {
        this.duration = this.playerElement?.duration || 0;
        if (this.playerElement?.autoplay) {
          this.autoPlay();
        }
      }
    );
  }
  setPlayerElement = (player: HTMLVmPlayerElement | HTMLVideoElement) => {
    runInAction(() => {
      this.playerElement = player;
      this.isSettled = true;
    });
    console.log('setPlayerElement', toJS(this));
  };

  setCurrentTime = (currentTime: number) => {
    runInAction(() => {
      this.currentTime = currentTime;
    });
  };

  setIsInteracted = () => {
    runInAction(() => {
      this.isInteracted = true;
    });
  };

  setIsReady = () => {
    runInAction(() => {
      this.isReady = true;
    });
  };

  setIsMuted = (muted: boolean) => {
    if (this.playerElement !== null) {
      this.playerElement.muted = muted;
    }
  };

  setIsPaused = () => {
    if (this.playerElement !== null) {
      this.isPaused = this.playerElement.paused;
    }
  };

  autoPlay = () => {
    this.play();
    this.setIsMuted(false);
  };

  handleTouch = (detail: unknown) => {
    console.log(detail);
  };

  //асинхронный вызов, для того чтобы проверить взаимодействовал ли пользователь c устройством
  play = async () => {
    try {
      await this.playerElement?.play();
      this.isInteracted = true;
    } catch (err) {
      console.warn('Autoplay failed, will try again on user gesture', err);
      this.isInteracted = false;
    }
  };

  pause = () => {
    this.playerElement?.pause();
  };

  reloadPlayer = () => {
    this.key++;
  };

  seek = (time: number) => {
    if (this.playerElement) {
      this.playerElement.currentTime = time;
    }
  };

  clear = () => {
    this.key = 0;
    this.currentTime = 0;
    this.isInteracted = false;
    this.isSettled = false;
    this.isPaused = null;
    this.isReady = false;
    this.playerElement = null;
    this.duration = 0;
  };

  get muted() {
    return this.playerElement?.muted;
  }
}

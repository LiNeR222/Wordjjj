import { isServer } from '@/shared/config';
import { SerializedError } from '@/shared/lib/serialized-error';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { FragmentWithError } from '../types';
import { extractNumberFromUrl } from '../utils/helpers';

export class PlayerStore {
  videoUrl: string | null = null;
  videoId: number | null = null;
  player: React.RefObject<HTMLVmPlayerElement> | null = null;
  container: React.RefObject<HTMLDivElement> | null = null;
  failedFragments: Map<string | number, FragmentWithError> = new Map();
  error: SerializedError | null = null;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.videoUrl,
      videoUrl => {
        if (videoUrl) {
          runInAction(() => {
            this.failedFragments.clear();
            this.getVideoIdFromUrl(videoUrl);
            this.error = null;
          });
        }
      }
    );
  }
  initialize = ({
    videoUrl,
    player,
    container,
  }: {
    videoUrl: string;
    player: React.RefObject<HTMLVmPlayerElement>;
    container: React.RefObject<HTMLDivElement>;
  }) => {
    runInAction(() => {
      this.videoUrl = videoUrl;
      this.player = player;
      this.container = container;
    });
  };
  getVideoIdFromUrl = (url: string): void => {
    const regex = /\/videos\/video\/(\d+)\/hls\//;
    this.videoId = extractNumberFromUrl(url, regex);
  };
  addFragmentWithError = (url: string | number, fragmentWithError: FragmentWithError): void => {
    this.failedFragments.set(url, fragmentWithError);
  };
  setError = (error: SerializedError | null): void => {
    this.error = error;
  };
}

export const playerStore = isServer ? ({} as PlayerStore) : new PlayerStore();

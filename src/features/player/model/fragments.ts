import { SerializedError } from '@/shared/lib/serialized-error';
import { makeAutoObservable } from 'mobx';
import { PlaylistFragment } from './fragment';

export class FragmentsStore {
  private fragmentLength = 10;
  public fragments: Map<number, Map<number, PlaylistFragment>> = new Map();
  constructor() {
    makeAutoObservable(this);
  }
  createFragment(videoId: number, sn: number, load: () => Promise<void>, error: SerializedError) {
    const fragment = new PlaylistFragment(videoId, sn, load, error);
    this.fragments.set(videoId, new Map([[sn, fragment]]));
  }
  deleteFragment(videoId: number, sn: number) {
    this.fragments.get(videoId)?.delete(sn);
  }
  getFragmentByTime(videoId: number, time: number) {
    return this.fragments.get(videoId)?.get(Math.floor(time / this.fragmentLength));
  }
  clear() {
    this.fragments.clear();
  }
  reload(videoId: number) {
    this.fragments.get(videoId)?.forEach(fragment => fragment.load());
  }
}

export const fragmentsStore = new FragmentsStore();

import { makeAutoObservable } from 'mobx';

class FormatVideoStore {
  wideFormat: boolean = false;
  constructor() {
    makeAutoObservable(this);
  }

  setWideFormat(wideFormat: boolean) {
    this.wideFormat = wideFormat;
  }

  setWideFormatToggle() {
    this.wideFormat = !this.wideFormat;
  }
}

export const formatVideoStore = new FormatVideoStore();

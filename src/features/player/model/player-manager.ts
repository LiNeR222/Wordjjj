import { EventEmitter } from 'events';

type PlayerEvent = 'isAuth' | 'logout' | 'isBought';

export class PlayerManager extends EventEmitter {
  on(event: PlayerEvent, listener: (payload?: unknown) => void): this {
    return super.on(event, listener);
  }

  emit(event: PlayerEvent, payload?: unknown): boolean {
    return super.emit(event, payload);
  }
}

export const playerManager = new PlayerManager();

import { EventEmitter } from 'events';
import { AuthRoutes } from '../types';

class AuthRouteManager extends EventEmitter {
  redirectTo(route: AuthRoutes) {
    this.emit('redirect', route);
  }
}

export const authRouteManager = new AuthRouteManager();

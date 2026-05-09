import { authStore } from '@/entities/auth/model/authStore';
import { sessionStore } from '@/entities/session/model/';
import { LoaderContext } from 'hls.js';

export const setHeaders = async (context: LoaderContext) => {
  context.headers ??= {};
  if (authStore.isAuth) {
    context.headers['Authorization'] = `Bearer ${authStore.token}`;
  } else {
    const session = await sessionStore.getSession();
    context.headers['x-session-id'] = `${session.id}`;
  }
};

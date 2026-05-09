import { SerializedError } from '@/shared/lib/serialized-error';
import { AUTH_ERROR_TYPE_MAP } from './constants';

export const handleAuthError = async (error: SerializedError, options?: { videoId?: string }): Promise<boolean> => {
  if (error.status) {
    //TODO: доработать *
    const handler = AUTH_ERROR_TYPE_MAP[error.status]?.[error.message || '*'];
    if (handler) {
      return await handler(options);
    }
  }
  return false;
};

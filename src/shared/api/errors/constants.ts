import { tokenErrors, authErrors } from '../constants';
import { buyVideo } from './buy-video';
import { refreshToken } from './refresh-token';
import { signIn } from './sign-in';

export const AUTH_ERROR_TYPE_MAP: Record<number, Record<string, (options?: { videoId?: string }) => Promise<boolean>>> = {
  401: {
    [tokenErrors.expired]: refreshToken,
    [tokenErrors.missing]: signIn,
    [tokenErrors.invalid]: signIn,
    'Authentication required to access this segment': signIn,
  },
  403: { [authErrors.authRequired]: signIn },
  402: { [authErrors.paymentRequired]: buyVideo },
};

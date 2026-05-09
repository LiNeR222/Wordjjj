import { isClient } from '../config';
import { CoreApi } from './coreApi';

export class PrivateApi extends CoreApi {
  private static instance: PrivateApi | null = null;
  static token: string | null = null;

  private constructor() {
    super();

    this.api.interceptors.request.use(async config => {
      let token = null;
      if (isClient) {
        const { tokenStore } = await import('@/entities/token/model');
        token = tokenStore.access_token;
      } else {
        const { cookies } = await import('next/headers');
        token = cookies().get('token')?.value || null;
      }

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  setAuthHeader = (token: string) => {
    this.api.defaults.headers.common.Authorization = `Bearer ${token}`;
  };

  public static getInstance(): PrivateApi {
    if (!PrivateApi.instance) {
      PrivateApi.instance = new PrivateApi();
    }
    return PrivateApi.instance;
  }
}

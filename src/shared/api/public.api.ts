import { CoreApi } from './coreApi';

export class PublicApi extends CoreApi {
  private static instance: PublicApi | null = null;

  private constructor() {
    super();

    this.api.interceptors.request.use(config => {
      config.withCredentials = false;

      if (config.headers && 'Authorization' in config.headers) {
        delete config.headers['Authorization'];
      }

      return config;
    });
  }

  public static getInstance(): PublicApi {
    if (!PublicApi.instance) {
      PublicApi.instance = new PublicApi();
    }

    return PublicApi.instance;
  }
}

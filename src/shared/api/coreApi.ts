//import { sessionStore } from '@/entities/session/model';
import { baseUrl } from '@/shared/config';
import { RequestType, RequestTypeWithData } from '@/shared/types';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { CacheAxiosResponse, setupCache } from 'axios-cache-interceptor';
import { extractErrorMessage } from '../lib';
import { SerializedError } from '../lib/serialized-error';
import { handleAuthError } from './errors/handle-auth-error';

const CONTENT_TYPE_JSON = 'application/json';

export abstract class CoreApi {
  protected api = setupCache(
    axios.create({
      baseURL: baseUrl,
      allowAbsoluteUrls: true,
    })
  );

  constructor() {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  private setupRequestInterceptor() {
    this.api.interceptors.request.use(config => {
      config.headers = config.headers || {};
      config.headers['Content-Type'] ??= CONTENT_TYPE_JSON;
      return config;
    });
  }

  private setupResponseInterceptor() {
    this.api.interceptors.response.use(
      (response: Partial<CacheAxiosResponse>): CacheAxiosResponse => response.data,
      async (error: unknown) => {
        const { response } = error as AxiosError;

        const serializedError = new SerializedError({
          status: response?.status,
          message: extractErrorMessage(response?.data),
        });

        const result = await handleAuthError(serializedError);

        if (result) {
          // повторный запрос
          return this.api.request((error as AxiosError).config as AxiosRequestConfig);
        }

        return Promise.reject(serializedError);
      }
    );
  } 
  

  get: RequestType = (...req) => this.api.get(...req);

  post: RequestTypeWithData = (...req) => this.api.post(...req);

  patch: RequestTypeWithData = (...req) => this.api.patch(...req);

  put: RequestTypeWithData = (...req) => this.api.put(...req);

  delete: RequestType = (...req) => this.api.delete(...req);

  request = <D>(config: AxiosRequestConfig<D>): Promise<D> => this.api.request(config);
}

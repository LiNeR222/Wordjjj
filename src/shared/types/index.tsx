import type { AxiosRequestConfig } from 'axios';
import { SerializedError } from '../lib/serialized-error';

export type QueryParams = object;

export interface CustomAxiosRequestConfig<T = unknown> extends AxiosRequestConfig<T> {
  queryParams?: QueryParams;
  cache?: { ttl: number };
}

export type RequestType = <D, R>(url: string, config?: CustomAxiosRequestConfig<D>) => Promise<R>;

export type RequestTypeWithData = <D, R>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>;

export type BaseApiRequest<T> = {
  request: () => Promise<T>;
};

export type InitialData<T> = {
  data?: T;
  error?: SerializedError;
};


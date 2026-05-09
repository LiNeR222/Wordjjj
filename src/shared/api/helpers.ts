import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { SerializedError } from '../lib/serialized-error';
import { tokenErrors } from './constants';

interface ErrorResponse {
  error?: string;
  detail?: string;
}

type AxiosRequest = (config: AxiosRequestConfig) => Promise<AxiosResponse>;

export const handleError = (error: unknown): SerializedError => {
  return new SerializedError({
    status: (error as { status?: number })?.status || 400,
    message: (error as Error)?.message || 'Неизвестная ошибка',
  });
};

const extractErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data;
  return (data as ErrorResponse)?.error || (data as ErrorResponse)?.detail || 'Неизвестная ошибка';
};

export const handleClientAuthError = async (error: AxiosError, request: AxiosRequest) => {
  const { authStore } = await import('@/entities/auth/model/authStore');

  const { response, config } = error;
  const errorMessage = extractErrorMessage(response?.data);

  try {
    if ([tokenErrors.missing, tokenErrors.invalid].includes(errorMessage)) {
      const result = await authStore.signIn();
      if (!result) {
        throw new Error('не удалось авторизоваться');
      }
    } else if (errorMessage === tokenErrors.expired) {
      await authStore.refreshAccessToken();
    } else {
      return Promise.reject(
        new SerializedError({
          status: 401,
          message: errorMessage,
        })
      );
    }

    return request(config as AxiosRequestConfig);
  } catch (err) {
    return Promise.reject(handleError(err));
  }
};

export const handleServerAuthError = async (error: AxiosError) => {
  const { response } = error;
  const errorMessage = extractErrorMessage(response?.data);
  return Promise.reject(
    new SerializedError({
      status: 401,
      message: errorMessage,
    })
  );
};

export const handleMockError = async (error: AxiosError) => {
  const { config } = error;
  // TODO: baseURL изменился, нужно переделать реализацию
  if (config?.baseURL?.endsWith('mock')) {
    /*console.log('404 error. Trying request to mock...', config.url);
    config.baseURL = config.baseURL!.replace('api/v1', 'api/mock');
    config.headers = config.headers || {};
    config.headers[MOCK_HEADER] = 'true';

    try {
      const newResponse = await this.api.request(config);
      return Promise.resolve(newResponse);
    } catch (newError) {
      return Promise.reject(this.handleError(newError));
    }*/
  }
};

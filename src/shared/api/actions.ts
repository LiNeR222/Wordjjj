'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import { baseUrl } from '../config';

export const refreshToken = async () => {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      throw new Error('Refresh token не найден');
    }

    const response = await axios.request({
      baseURL: baseUrl,
      url: '/api/token',
      headers: { cookie: `refresh_token=${refreshToken}` },
    });

    cookies().set('token', response.data.access_token, { path: '/' });

    return response.data.access_token;


  } catch (error) {
    console.log('Ошибка при обновлении токена:', error);
    return false;
  }
};

export const setToken = async (token: string) => {
  cookies().set('token', token, { path: '/' });
};

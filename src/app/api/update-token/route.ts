import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // Получаем cookie-хранилище
  const cookieStore = cookies();
  // Извлекаем refresh-token
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return new Response('Токен не найден', { status: 401 });
  }

  const apiResponse = await fetch('https://interesnoitochka.ru/api/v1/auth/jwt/access/new/?token=' + refreshToken, {
    method: 'POST',
  });

  if (!apiResponse.ok) {
    return new Response('Токен не обновлен', { status: 401 });
  }

  const data = await apiResponse.json();
  console.log(data);

  const response = NextResponse.json({ success: true, access_token: data?.access_token });

  return response;
}

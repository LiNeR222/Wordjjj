import { ACCESS_TOKEN_KEY } from '@/entities/token/model/constants';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return new Response('Токен не найден', { status: 401 });
  }

  const apiResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/api/v1/auth/jwt/access/new/?token=${refreshToken}`,
    {
      method: 'POST',
    }
  );


  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return new Response(`Токен не обновлен: ${JSON.stringify(data)}`, { status: 401 });
  }

  const response = NextResponse.json({ success: true, access_token: data?.access_token });
  response.cookies.set(ACCESS_TOKEN_KEY, data?.access_token, {
    path: '/',
    sameSite: 'strict',
  });
  return response;
}

export async function POST(request: Request) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return NextResponse.json({ error: 'Refresh token отсутствует' }, { status: 400 });
  }

  // Создаем ответ и устанавливаем refresh token в HttpOnly cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    path: '/',
    sameSite: 'strict',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    maxAge: 0,
  });
  return response;
}

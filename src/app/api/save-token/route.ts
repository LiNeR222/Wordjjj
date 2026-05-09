import { NextResponse } from 'next/server';

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

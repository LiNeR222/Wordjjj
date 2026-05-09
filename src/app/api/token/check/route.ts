export async function POST(request: Request) {
  const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/api/v1/auth/jwt/you`;

  try {
    // Копируем заголовки из исходного запроса
    const headers = new Headers(request.headers);

    // Отправляем новый запрос на сервер с сохранением заголовков
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      cache: 'no-store',
    });

    // Если сервер вернул не OK статус, выбрасываем ошибку
    if (!response.ok) {
      const text = await response.text();
      let error: string;

      try {
        const json = JSON.parse(text);
        error = json?.detail || text; // Берем `detail`, если это объект, иначе используем сам текст
      } catch {
        error = text; // Если это не JSON, просто передаем текст
      }

      throw new Error(error === 'Only jwt auth' ? 'check: Only jwt auth' : error);
    }

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);

    return new Response(
      JSON.stringify({
        message: 'Ошибка при проверке токена',
        error: error instanceof Error ? error.message : error,
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

'use client'; // Этот файл должен быть клиентским компонентом

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Логирование ошибки для анализа
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center h-screen p-16">
      <h2>Что-то пошло не так!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Попробовать снова</button>
    </div>
  );
}

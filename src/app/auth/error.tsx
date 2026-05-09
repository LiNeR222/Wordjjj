'use client';

import { useRouter } from 'next/navigation';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  //ToDO проработать стили
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-[50]'>
      <div className='relative bg-white p-6 pt-8 rounded-2xl shadow-lg '>
        {/* Заголовок ошибки */}
        <h2 className='text-3xl font-bold text-red-600 mb-4'>Что-то пошло не так!</h2>

        {/* Сообщение об ошибке */}
        <p className='text-gray-700 text-lg mb-8'>{error.message}</p>

        {/* Кнопки действий */}
        <div className='flex space-x-4'>
          {/* Кнопка "Попробовать снова" */}
          <button
            className='bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors'
            onClick={() => reset()}>
            Попробовать снова
          </button>

          {/* Кнопка "Назад" */}
          <button
            className='bg-gray-300 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-400 transition-colors'
            onClick={() => router.back()}>
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

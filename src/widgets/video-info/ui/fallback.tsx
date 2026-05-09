'use client';
import { useRouter } from 'next/navigation';

export const Fallback = () => {
  const router = useRouter();
  router.push('/not-found');
  return <div className='h-full p-6 bg-white rounded-lg'>Видео не найдено</div>;
};

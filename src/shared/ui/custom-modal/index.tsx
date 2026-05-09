'use client';

import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { Icon } from '@/shared/ui';
import { useRouter } from 'next/navigation';
import { FC, PropsWithChildren, useEffect } from 'react';

export const CustomModal: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const isHydrated = useHydrationState();
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleCancel = () => {
    router.back();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      role='dialog'
      aria-modal='true'>
      <div className='relative'>
        {isHydrated && (
          <button
            onClick={handleCancel}
            className='absolute translate-x-auto sm:translate-x-1/2 -right-3 flex items-center justify-center rounded-full w-12 h-12 bg-white cursor-pointer border-none hover:opacity-80 z-30'>
            <Icon type='close-button' className='w-3 h-3' />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

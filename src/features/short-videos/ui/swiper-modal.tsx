'use client';

import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { Icon } from '@/shared/ui';
import { Modal } from '@/shared/ui/modal';
import { useRouter } from 'next/navigation';
import { FC, PropsWithChildren } from 'react';
import styles from './styles.module.css';

export const SwiperModal: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const isHydrated = useHydrationState();
  const handleCancel = () => {
    router.back();
  };

  if (!isHydrated) return null;

  return (
    <Modal
      className={styles['feed-modal']}
      centered
      footer={null}
      open={true}
      onCancel={handleCancel}
      closeIcon={null}
      width='fit-content'
      style={{ height: '100vh', width: '100vw' }}>
      <>
        <button
          onClick={handleCancel}
          className='absolute translate-x-auto sm:translate-x-1/2 -right-3 flex items-center justify-center rounded-full w-12 h-12 bg-white cursor-pointer border-none hover:opacity-80 z-30'>
          <Icon type='close-button' className='w-3 h-3' />
        </button>
        {children}
      </>
    </Modal>
  );
};

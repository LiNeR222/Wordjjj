'use client';

import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { useDidUpdate } from '@/shared/lib/use-update-effect';
import { Modal } from '@/shared/ui/modal';
import { useRouter } from 'next/navigation';
import { FC, PropsWithChildren } from 'react';
import { useModal } from '../model/context';

export const UploadVideoModal: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { isModalOpen, closeModal } = useModal();

  useDidUpdate(() => {
    if (!isModalOpen) {
      router.back();
    }
  }, [isModalOpen]);

  const isHydrated = useHydrationState();
  if (!isHydrated) return null;

  const handleCancel = () => {
    closeModal();
    //router.back();
  };

  return (
    <Modal
      open={isModalOpen}
      title={<span className='text-2xl font-bold'>Поделиться видео</span>}
      onCancel={handleCancel}
      centered={true}
      footer={null}
      wrapClassName='py-[30px]'
      width={500}>
      {children}
    </Modal>
  );
};

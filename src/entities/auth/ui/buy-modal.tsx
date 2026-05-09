'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { Icon } from '@/shared/ui/icon';
import { Modal } from '@/shared/ui/modal';
import { observer } from 'mobx-react-lite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { BuyVideo } from './buy';

export const BuyModal = observer(() => {
  const { buyVideo, abortController } = authStore;
  const searchParams = useSearchParams();
  const returnPath = searchParams.get('return_to');
  
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    if (hasRun.current) return;
    hasRun.current = true;

    buyVideo(false).then(isBought => {
      if (isBought) {
        if (returnPath) {
          router.push(returnPath);
        } else {
          router.back();
        }
      }
    });
  }, [returnPath, router]);

  const handleCancel = () => {
    abortController?.abort();
    if (returnPath) {
      router.push(returnPath);
    } else {
      router.back();
    }
  };

  return (
    <Modal
      rootClassName={styles.modal}
      className='backdrop-blur-sm'
      centered
      footer={null}
      open={true}
      onCancel={handleCancel}
      width={380}
      closeIcon={
        <span className='bg-[#0000000D] p-[10px] rounded-lg'>
          <Icon type='close-button' className='w-3 h-3' />
        </span>
      }>
      <BuyVideo />
    </Modal>
  );
});

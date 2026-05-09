'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { SignIn } from '@/entities/auth/ui/sign-in';
import { Icon } from '@/shared/ui/icon';
import { Modal } from '@/shared/ui/modal';
import { observer } from 'mobx-react-lite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import styles from './styles.module.css';

export const AuthModal = observer(() => {
  const { signIn, abortController } = authStore;
  const searchParams = useSearchParams();
  const videoId = searchParams?.get('videoId');
  
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    if (hasRun.current) return;
    hasRun.current = true;

    signIn(false, videoId || undefined).then(isAuth => {
      if (isAuth) {
        router.back();
      }
    });
  }, [router, videoId]);

  const handleCancel = () => {
    abortController?.abort();
    router.back();
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
      <SignIn />
    </Modal>
  );
});

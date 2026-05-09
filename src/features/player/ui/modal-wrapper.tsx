import { authStore } from '@/entities/auth/model/authStore';
import { Icon } from '@/shared/ui/icon';
import { Modal } from '@/shared/ui/modal';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useRef } from 'react';

interface ModalWrapperProps {
  videoId: number;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const ModalWrapper: FC<ModalWrapperProps> = observer(({ children, isOpen, onClose, videoId }) => {
  const { signIn, abortController } = authStore;
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }

    signIn(false, String(videoId) || undefined).then(isAuth => {
      if (isCancelled) {
        return;
      }
      if (isAuth) {
        onCloseRef.current();
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, signIn, videoId]);

  const handleCancel = () => {
    abortController?.abort();
    onClose();
  };

  return (
    <Modal
      className='backdrop-blur-sm'
      centered
      footer={null}
      open={isOpen}
      onCancel={handleCancel}
      width={380}
      closeIcon={
        <span className='bg-[#0000000D] p-[10px] rounded-lg'>
          <Icon type='close-button' className='w-3 h-3' />
        </span>
      }>
      {children}
    </Modal>
  );
});

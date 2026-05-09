'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { Modal } from '@/shared/ui/modal';
import { observer } from 'mobx-react-lite';
import { UserProfile } from './user-profile';
import './user-profile-modal.css';
export const UserProfileModal = observer(() => {
  if (!authStore?.userStore) return null;
  const { isProfileModalOpen, closeProfileModal } = authStore.userStore;
  return (
    <Modal
      open={isProfileModalOpen}
      footer={null}
      onCancel={closeProfileModal}
      className='custom-modal'
      width={'400px'}>
      <UserProfile />
    </Modal>
  );
});

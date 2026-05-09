import { authStore } from '@/entities/auth/model/authStore';

export const useOpenProfile = () => {
  const { openProfileModal } = authStore?.userStore || {};

  const handleOpenProfile = () => {
    if (authStore.isAuth) {
      if (!openProfileModal) {
        console.error('Текущий пользователь не инициализирован');
        return;
      }
      openProfileModal();
    } else {
      authStore.signIn();
    }
  };

  return handleOpenProfile;
};

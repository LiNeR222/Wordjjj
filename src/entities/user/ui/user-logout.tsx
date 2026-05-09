import { authStore } from '@/entities/auth/model/authStore';
import { Button } from '@/shared/ui';
import { Icon } from '@/shared/ui/icon';

export const UserLogout = () => {
  return (
    <Button className='flex items-center gap-x-10' onClick={authStore.logout} variant='dark'>
      <Icon type='power' className='flex justify-center content-center w-4 h-4' />
      <span>Выйти</span>
    </Button>
  );
};

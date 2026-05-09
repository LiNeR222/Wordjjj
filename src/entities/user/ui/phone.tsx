import { authStore } from '@/entities/auth/model/authStore';
import { observer } from 'mobx-react-lite';

export const Phone = observer(() => {
  if (!authStore.userStore) return null;
  const { user } = authStore?.userStore;
  return (
    <div className='space-y-2'>
      <div className='block text-[17px] font-bold text-black'>Телефон пользователя</div>
      <div className='text-base text-black'>{user.phone}</div>
    </div>
  );
});

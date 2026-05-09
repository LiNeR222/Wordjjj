'use client';

import { Menu } from '@/components/ui/menu';
import { authStore } from '@/entities/auth/model/authStore';
import { useOpenProfile } from '@/entities/user/lib/useOpenProfile';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { Button } from '@/shared/ui';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { LuCircleUser, LuFileVideo, LuLogIn, LuLogOut } from 'react-icons/lu';
import styles from './user.module.css';

export const HeaderUser = observer(() => {
  const openProfile = useOpenProfile();
  const router = useRouter();
  const isHydrated = useHydrationState();

  if (!isHydrated) {
    return <UserAvatar size={36} />;
  }

  const { isAuth, user } = authStore;

  return isAuth ? (
    <Menu
      trigger={<UserAvatar size={36} userName={user?.name} src={user?.profile_picture} fontSize={19} />}
      options={[
        { title: 'Мой аккаунт', label: 'account', icon: <LuCircleUser />, onClick: openProfile },
        { title: 'Мои видео', label: 'videos', icon: <LuFileVideo />, onClick: () => router.push('/my-videos') },
        { title: '', label: 'separator' },
        { title: 'Выйти', label: 'logout', icon: <LuLogOut />, onClick: authStore.logout },
      ]}
    />
  ) : (
    <Button className={styles['sign-in']} variant='dark' onClick={() => authStore.signIn()}>
      <LuLogIn />
      <span>Войти</span>
    </Button>
  );
});

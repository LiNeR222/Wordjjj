'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
//import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { Button } from '@/shared/ui';
import { Dropdown } from '@/shared/ui/dropdown';
import { MenuProps } from 'antd';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { LuCircleUser, LuFileVideo, LuLogIn, LuLogOut, LuMessageCircle } from 'react-icons/lu';
import styles from './nav-menu.module.css';

export const NavMenu = observer(() => {
  const pathname = usePathname();
  const videoIdMatch = pathname.match(/\/video\/(\d+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'account',
        onClick: () => authStore?.userStore?.openProfileModal(),
        label: (
          <div className={styles.menuContent}>
            <LuCircleUser />
            <span>Мой аккаунт</span>
          </div>
        ),
      },
      {
        key: 'videos',
        label: (
          <Link href='/my-videos' className={styles.menuContent}>
            <LuFileVideo />
            <span>Мои видео</span>
          </Link>
        ),
      },
      {
        key: 'chats',
        label: (
          <Link href='/chats' className={styles.menuContent}>
            <LuMessageCircle />
            <span>Мои чаты</span>
          </Link>
        ),
      },
      { type: 'divider' },
      {
        key: 'logout',
        onClick: authStore.logout,
        label: (
          <div className={styles.menuContent}>
            <LuLogOut />
            <span>Выйти</span>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authStore?.userStore?.openProfileModal]
  );
  const isHydrated = useHydrationState();

  const { user, isAuth } = authStore;

  if (isHydrated && isAuth) {
    return (
      <Dropdown menu={{ items, style: { padding: '4px' } }} trigger={['click']}>
        <div>
          <UserAvatar src={user?.profile_picture} userName={user?.name} size={36} fontSize={19} />
        </div>
      </Dropdown>
    );
  }

  return (
    <Button className={styles['sign-in']} variant='dark'>
      <Link href={videoId ? `/auth?videoId=${videoId}` : '/auth'} className={styles.menuContent}>
        <LuLogIn />
        <span>Войти</span>
      </Link>
    </Button>
  );
});

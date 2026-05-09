import { authStore } from '@/entities/auth/model/authStore';
import { MenuProps } from 'antd';
import Link from 'next/link';
import { LuCircleUser, LuFileVideo, LuLogOut } from 'react-icons/lu';
import styles from '../ui/nav-menu.module.css';

export const items: MenuProps['items'] = [
  {
    key: 'account',
    onClick: authStore.userStore?.openProfileModal,
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
];

export const theme = {
  components: {
    Dropdown: {
      itemStyle: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
      },
    },
  },
};

import type { MenuProps } from 'antd';
import { FaUserTimes } from 'react-icons/fa';
import { IoMdNotifications, IoMdNotificationsOff } from 'react-icons/io';

export const subscriptionMenuItems: MenuProps['items'] = [
  {
    label: 'Уведомлять',
    key: '1',
    icon: <IoMdNotifications />,
  },
  {
    label: 'Не уведомлять',
    key: '2',
    icon: <IoMdNotificationsOff />,
  },
  {
    label: 'Отписаться',
    key: '3',
    icon: <FaUserTimes />,
  },
];

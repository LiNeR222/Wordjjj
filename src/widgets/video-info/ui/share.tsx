'use client';

import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { Dropdown } from '@/shared/ui/dropdown';
import { message } from '@/shared/ui/message';
import { MenuProps } from 'antd';
import { IoMdShare } from 'react-icons/io';

export const ShareAction = () => {
  const isHydrated = useHydrationState();

  const actionMap = new Map([['1', () => copyToClipboard()]]);

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: 'Копировать ссылку',
    },
  ];

  const handleMenuClick = (event: { key: string }) => {
    const action = actionMap.get(event.key);
    action?.();
  };

  const getShareLink = () => {
    if (typeof window === 'undefined') return '';
    //const src = `https://interesnoitochka.ru/video/${video.video_id}`;
    return window.location.href;
  };

  const copyToClipboard = () => {
    const link = getShareLink();
    navigator.clipboard
      .writeText(link)
      .then(() => {
        message.success('Ссылка скопирована!');
      })
      .catch(err => {
        console.error('Ошибка при копировании:', err);
      });
  };

  if (!isHydrated) return null;

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} placement='bottomRight' className='cursor-pointer'>
      <IoMdShare fontSize={20} />
    </Dropdown>
  );
};

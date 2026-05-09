'use client';

import { Dropdown, MenuProps } from 'antd';
import Link from 'next/link';
import { FC, useState } from 'react';
import { IoMdMore } from 'react-icons/io';
import { myVideoStore } from '../model/my-video-store';
interface IContextMenuProps {
  video_id: number;
}

export const ContextMenu: FC<IContextMenuProps> = ({ video_id }) => {
  const [isOpen, setIsOpen] = useState(false);

  const items: MenuProps['items'] = [
    {
      key: 'utm',
      label: <span>Сформировать utm-ссылку</span>,
    },
    {
      key: 'edit',
      label: (
        <Link href={`/video/${video_id}/edit`}>
          <span>Редактировать</span>
        </Link>
      ),
    },
    {
      key: 'delete',
      onClick: async () => {
        myVideoStore.deleteVideo(video_id);
      },
      label: <span>Удалить</span>,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} open={isOpen} onOpenChange={setIsOpen}>
      <button className='py-2 px-1 bg-black rounded-lg hover:bg-gray-700 text-white focus:ring-4 focus:outline-none focus:ring-gray-50'>
        <IoMdMore fontSize={20} />
      </button>
    </Dropdown>
  );
};

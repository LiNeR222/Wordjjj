'use client';
import { Icon } from '@/shared/ui';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { GradientBar } from './gradient-bar';

interface SidebarNavItemProps {
  icon: string;
  path?: string;
  title?: string;
}

export const SidebarNavItem: FC<SidebarNavItemProps> = ({ icon, path, title }) => {
  const pathname = usePathname();

  const isActive = pathname === path;

  return (
    <div
      {...(title ? { title } : {})}
      className={clsx(
        isActive ? 'opacity-100' : 'opacity-50 ',
        'relative w-10 h-10 m-1 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition'
      )}>
      <Icon type={icon} className='w-5 h-5' />
      {isActive && <GradientBar />}
    </div>
  );
};

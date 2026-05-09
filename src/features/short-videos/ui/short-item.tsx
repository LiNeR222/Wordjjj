'use client';
import { ChannelAvatar } from '@/entities/channel/ui/channel_avatar';
import { Video } from '@/entities/video/types';
import { resolveImageURL } from '@/shared/lib';
import clsx from 'clsx';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { shortsWidth } from '../config';
import styles from './styles.module.css';

export function ShortItemComponent({
  video_id,
  title,
  preview_image,
  channel_id,
  channel_name,
  channel_avatar,
  numbers_views,
  date_publication,
}: Video & { isActive: boolean }) {
  
  const src = resolveImageURL(preview_image, video_id);

  return (
    <div className='flex justify-center cursor-pointer group'>
      <div className='rounded-2xl hover:bg-gray-100 p-2 transition-all duration-300 hover:scale-105 transform-gpu'>
        <Image
          className={clsx(
            'bg-black rounded-2xl object-cover aspect-[9/16] pointer-events-none select-none transition-transform duration-300',
            `w-[${shortsWidth}px]`
          )}
          width={900}
          height={1600}
          src={src}
          alt='short video'
        />
        <div className={clsx('flex gap-x-2 mt-2', `h-[70px] w-[${shortsWidth}px]`)}>
          <div className='flex-shrink-0'>
            <Link href={`/#${channel_id}`}>
              <ChannelAvatar size={24} channel={{ id: channel_id, name: channel_name, avatar: channel_avatar }} />
            </Link>
          </div>
          <div className='min-w-0'>
            <p className={clsx('font-semibold', styles.title)}>{title}</p>
            <p className='text-xs'>{channel_name}</p>
            <p className='text-xs text-gray-400 block'>
              {numbers_views} просмотров •{' '}
              {formatDistance(new Date(date_publication), new Date(), { addSuffix: true, locale: ru })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ShortItem = memo(ShortItemComponent);
ShortItem.displayName = 'ShortItem';
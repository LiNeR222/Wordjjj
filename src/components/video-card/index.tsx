'use client';
import clsx from 'clsx';
import { FC, MouseEvent, useRef } from 'react';
import Avatar from '../Avatar';
import styles from './video-card.module.css';

import { getPreviewVideo } from '@/shared/lib/getVideoPreview';
import Image from 'next/image';
import Link from 'next/link';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { Shorts } from '../shorts';

export const VideoCard: FC<{ isShort?: boolean }> = ({ isShort = false }) => {
  const triggerOpenShorts = useRef<HTMLButtonElement | null>(null);

  const handleOpenShorts = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isShort) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    triggerOpenShorts.current?.click();
  };
  const src = isShort
    ? 'https://i.vimeocdn.com/video/1963574657-631176f0ffd56c75a37e9e4d36aadde1f68be7802ca7fc252fe3e028d6ed558b-d_960x540?r=pad'
    : getPreviewVideo(1);
  return (
    <>
      <Shorts trigger={<button hidden ref={triggerOpenShorts} />} />
      <Link onClick={handleOpenShorts} className={styles.card} href='/video/27'>
        <div className={clsx(styles.preview, { [styles.short]: isShort })}>
          <Image className='w-full' src={src} alt='video card preview' height={400} width={1600} />
          <span>03:32</span>
          {0.3 < 0.5 && !isShort && (
            <p>
              <MdOutlineAttachMoney />
              Платное
            </p>
          )}
        </div>
        <div className={styles.body}>
          <Avatar size={24} title='M' />
          <div className={styles.info}>
            <p className={styles.title}>{isShort ? 'The Tornado Outside' : 'Instruments of a Beating'}</p>
            <span className={styles.author}>Рушан Привет</span>
            <span className={styles.views}>3,402 пр. • 16 дней тому</span>
          </div>
        </div>
      </Link>
    </>
  );
};

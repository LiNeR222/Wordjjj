'use client';

import { Player } from '@/components/player';
import { useEffect, useRef, useState } from 'react';

import styles from './media.module.css';

export const VideoMedia = () => {
  const ref = useRef<HTMLVideoElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [time, setTime] = useState(0);

  const handleTimeUpdate = () => {
    setTime(ref.current?.currentTime || 0);
  };

  useEffect(() => {
    if (time > 5) {
      setIsOpen(true);
      ref.current?.pause();
    }
  }, [time]);

  return (
    <div className={styles.media}>
      <Player ref={ref} onTimeUpdate={handleTimeUpdate} />
      {isOpen && (
        <div className={styles.auth}>
          <div className={styles.auth__content}></div>
        </div>
      )}
    </div>
  );
};

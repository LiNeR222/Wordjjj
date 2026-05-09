'use client';

import { Auth } from '@/entities/auth/ui/auth';
import { FC, memo, useEffect, useState } from 'react';
import styles from './style.module.css';

export const AuthModal: FC<{ show: boolean | undefined }> = memo(({ show }) => {
  const [session, setSession] = useState<{ id: string; auth: boolean } | null>(null);
  useEffect(() => {
    const storedSession = localStorage.getItem('session') ? JSON.parse(localStorage.getItem('session') as string) : {};
    setSession(storedSession);
  }, [show]);

  if (!session?.id || !show) {
    return;
  }

  return (
    <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center backdrop-blur-sm z-[10]'>
      <div className={styles.content}>
        <Auth
          sessionId={session.id}
          title='Вход в учетную запись'
          subtitle='Выберите удобный способ входа'
          hintText='Отсканируйте камерой телефона для быстрого входа.'
          actionText='Войти через'
        />
      </div>
    </div>
  );
});

AuthModal.displayName = 'AuthModal';

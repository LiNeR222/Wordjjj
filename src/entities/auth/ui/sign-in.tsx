'use client';

import { sessionStore } from '@/entities/session/model';
import { observer } from 'mobx-react-lite';
import { Auth } from './auth';

export const SignIn = observer(() => {
  const { session } = sessionStore;

  if (!session?.id) {
    return null;
  }

  return (
    <Auth
      sessionId={session?.id}
      title='Вход в учетную запись'
      subtitle='Выберите удобный способ входа'
      hintText='Отсканируйте камерой телефона для быстрого входа.'
      actionText='Войти через'
    />
  );
});

'use client';

import { sessionStore } from '@/entities/session/model';
import { observer } from 'mobx-react-lite';
import { Auth } from './auth';

export const BuyVideo = observer(() => {
  const { session } = sessionStore;

  if (!session?.id) {
    return null;
  }

  return (
    <Auth
      sessionId={session?.id}
      title='Необходима покупка'
      subtitle='Выберите удобный способ покупки'
      hintText='Отсканируйте камерой телефона для покупки видео.'
      actionText='Купить через'
    />
  );
});

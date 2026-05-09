import { authStore } from '@/entities/auth/model/authStore';
import { BuyVideo } from '@/entities/auth/ui/buy';
import { SignIn } from '@/entities/auth/ui/sign-in';
import { videoListStore } from '@/entities/video/model/video-list-store';
import { useDidUpdate } from '@/shared/lib/use-update-effect';
import { observer } from 'mobx-react-lite';
import { FC, useCallback, useEffect, useState } from 'react';
import { fragmentsStore } from '../model/fragments';
import { AuthError } from './auth-error';
import { BuyError } from './buy-error';
import { ModalWrapper } from './modal-wrapper';

interface TimeControlProps {
  videoId: number;
}

export const TimeControl: FC<TimeControlProps> = observer(({ videoId }) => {
  const { isAuth } = authStore;
  const { video, player } = videoListStore.videos.get(videoId) ?? {};
  const [isModalReady, setIsModalReady] = useState(false);
  const time = player?.currentTime || 0;
  const handleModalClose = useCallback(() => {
    setIsModalReady(false);
  }, []);

  useEffect(() => {
    setIsModalReady(true);
    const trunkedTime = Math.trunc(time);
    if (trunkedTime !== 0 && trunkedTime % 10 === 0) {
      const url = new URL(window.location.href);
      url.searchParams.set('time', trunkedTime.toString());
      window.history.replaceState(null, '', url.toString());
    }
  }, [time]);

  useDidUpdate(() => {
    if ((isAuth || video?.bought) && time !== 0 && videoId) {
      fragmentsStore.reload(videoId);
      return;
    } else if (isAuth || video?.bought) {
      player?.reloadPlayer();
    }
  }, [isAuth, video]);

  let isAuthError = false;
  let isBuyError = false;

  if (video) {
    const { bought = false, time_not_pay = 0, time_not_reg = 0, free = true } = video;
    isAuthError = !isAuth && time_not_reg !== null && time >= time_not_reg;
    isBuyError = !free && !bought && time_not_pay !== null && time >= time_not_pay;
  }

  const hasError = isAuthError || isBuyError;

  if (hasError && player && !player.isPaused) {
    player?.pause();
  }

  // Показывать ошибки только на старте
  if (hasError && time === 0) {
    if (isAuthError) return <AuthError />;
    return <BuyError />;
  }

  return (
    <ModalWrapper isOpen={hasError && isModalReady} onClose={handleModalClose} videoId={videoId}>
      {isAuthError ? <SignIn /> : <BuyVideo />}
    </ModalWrapper>
  );
});

TimeControl.displayName = 'TimeControl';

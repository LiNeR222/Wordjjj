import { useEffect } from 'react';
import { playerStore } from '../model/player-store';
import { handleHlsError } from './handle-hls-errors';

// хук для обработки ошибки авторизации нулевого сегмента
// vime player не вызывает событие vmError при ошибке авторизации нулевого сегмента
// поэтому приходится делать подписку на событие onVmPlaybackReady и обрабатывать ошибку вручную
export const useHandlePlayback = (player: React.RefObject<HTMLVmPlayerElement>) => {
  let timer: NodeJS.Timeout | undefined;

  if (timer) clearTimeout(timer);

  const handleFirstFragmentError = async (e: unknown) => {
    // если нет ошибок или ошибка не нулевого фрагмента, то очищаем таймер и выходим
    if (playerStore.failedFragments.size === 0 || !playerStore.failedFragments.has(0)) {
      console.log('Ошибка нулевого фрагмента не найдена');
      clearTimeout(timer);
      return true;
    }
    return await handleHlsError(e, player);
  };

  const handlePlaybackReady = async (e: unknown) => {
    if (timer) clearTimeout(timer);
    const result = await handleFirstFragmentError(e);
    // если ошибка авторизации нулевого фрагмента не решена, то снова запускаем таймер
    if (!result) {
      timer = setTimeout(() => handlePlaybackReady(e), 5000);
    }
  };

  useEffect(() => {
    return () => timer && clearTimeout(timer);
  }, [timer]);

  return { handlePlaybackReady };
};

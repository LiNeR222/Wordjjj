import { handleAuthError } from '@/shared/api/errors/handle-auth-error';
import { SerializedError } from '@/shared/lib/serialized-error';
import { playerStore } from '../model/player-store';

export const handleHlsError = async (e: unknown, player: React.RefObject<HTMLVmPlayerElement>) => {
  const response =
    (e as { detail: { data: { response: { code: number; url: string } } } })?.detail?.data?.response ?? {};
  const { code, url } = response;

  if (code === 404 && url.endsWith('playlist.m3u8')) {
    playerStore.setError(new SerializedError({ status: 404, message: 'Видео не найдено. Попробуйте позже.' }));
    return;
  }

  //TODO: Возможно сделать обработку ошибок без сохранения фрагментов в хранилище плеера context и loader содержится в e
  if (player && player.current) {
    const currentTime = player.current.currentTime;
    const currentFragment = Math.floor(currentTime / 10);
    const fragmentWithError = playerStore.failedFragments.get(currentFragment);
    if (fragmentWithError) {
      player.current.pause();
      player.current.currentTime = player.current.currentTime - 0.1;
      const result = await handleAuthError(fragmentWithError.error);
      if (result) {
        await fragmentWithError.load();
        //не успевают обновиться заголовки с токеном, если сразу воспроизводить, поэтому запускает пользователь
        //player.current.play();
      } else {
        console.log('Не удалось решить проблему авторизации');
        console.dir(fragmentWithError.error);
      }
    }
  }
};

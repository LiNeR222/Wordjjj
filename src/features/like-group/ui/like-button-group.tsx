import { LikeButton } from '@/entities/like';
import { likeListStore } from '@/entities/like/model/likeListStore';
import { VideoLikes } from '@/entities/like/types';
import { tokenStore } from '@/entities/token/model';
import { useEffect } from 'react';

/** initialLikes - лайки, полученные и отрисованные на сервере.
 * С учетом того, что на сервере нет формы авторизации, initialLikes загружаются
 * публичным апи без использования токена. Поэтому при загрузке страницы на клиенте,
 * данные лайков обновляются (likeStore.fetchLike) с учетом авторизации пользователя
 */

export const LikeButtonGroup = ({ initialLikes, videoId }: { initialLikes: VideoLikes; videoId: number }) => {
  const { hasToken } = tokenStore;
  const { getLikeByVideoId } = likeListStore;

  useEffect(() => {
    const updateLikes = async () => {
      const likeStore = await getLikeByVideoId(videoId);
      if (likeStore) {
        likeStore.fetchLike();
      }
    };

    //если пользователь авторизован, то обновляем статус лайка с учетом авторизации
    if (hasToken) updateLikes();
  }, [getLikeByVideoId, hasToken, videoId]);

  return (
    <div className='flex items-center gap-2'>
      <LikeButton type='like' initialLikes={initialLikes} videoId={videoId} />
      <LikeButton type='dislike' initialLikes={initialLikes} videoId={videoId} />
    </div>
  );
};

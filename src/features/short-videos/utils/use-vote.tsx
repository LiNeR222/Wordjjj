import { likeApi } from '@/entities/like';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useVote = () => {
  const pathname = usePathname();
  const [videoId, setVideoId] = useState<number | null>(null);

  useEffect(() => {
    const [name, idString] = pathname.split('/').filter(Boolean);

    if (!name || !idString || isNaN(+idString)) {
      console.warn('Некорректный путь:', pathname);
      return;
    }

    const currentId = +idString;

    if (currentId) {
      setVideoId(currentId);
    }
  }, [pathname]);

  const vote = (status: 'like' | 'dislike' | 'null') => {
    if (!videoId) return;
    likeApi.putLike({ status, videoId });
  };

  return { videoId, vote };
};

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

//изменение window.history при свайпе шортсов
export const useShortsHistory = (videoId: number) => {
  const pathname = usePathname();

  useEffect(() => {
    if (!videoId) return;
    const [name, idString] = pathname.split('/').filter(Boolean);

    const currentId = Number(idString ?? 0);
    
    if (!name || isNaN(currentId)) {
      console.warn('Некорректный путь:', pathname);
      return;
    }

    if (currentId === videoId) return;

    const newPath = `/${name}/${videoId}`;
    window.history.replaceState(null, '', newPath);
  }, [videoId, pathname]);
};

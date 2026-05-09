'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { sessionStore } from './index';

// Компонент для отслеживания изменений в URL и обновления параметров в sessionStore
export const SessionURLListener = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevVideoIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Получаем текущий videoId
    const videoId = searchParams?.get('videoId');
    
    // Получаем videoId из пути URL (если формат /video/123)
    const pathVideoIdMatch = pathname?.match(/\/video\/(\d+)/);
    const pathVideoId = pathVideoIdMatch ? pathVideoIdMatch[1] : null;
    
    // Используем videoId из параметров URL или из пути
    const currentVideoId = videoId || pathVideoId;
    
    // Если это первый рендер или videoId изменился
    if (currentVideoId !== prevVideoIdRef.current) {
      console.log('[SessionURLListener] VideoId changed:', prevVideoIdRef.current, '->', currentVideoId);
      prevVideoIdRef.current = currentVideoId;
      
      // Обновляем параметры URL в sessionStore
      sessionStore.updateURLParams();
      
      // Если текущий videoId отличается от предыдущего и он существует, принудительно пересоздаем сессию
      if (currentVideoId) {
        // Используем setTimeout, чтобы дать время на обновление параметров
        setTimeout(() => {
          sessionStore.forceCreateNewSession();
        }, 0);
      }
    }
  }, [pathname, searchParams]);
  
  return null; // Этот компонент не рендерит никакого UI
}; 
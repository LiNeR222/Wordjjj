import { RecommendationsVideoStore } from '@/entities/video/model/recommendationsVideoStore';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { parseSearchParams } from './helpers';

export const useUpdateRecommendationsQuery = (recommendationsVideoStore: RecommendationsVideoStore) => {
  const pathname = usePathname();
  const refInitPathname = useRef<string | null>(null);

  useEffect(() => {
    if (refInitPathname.current !== null) return;
    refInitPathname.current = pathname;
  }, [pathname]);

  const searchParams = useSearchParams();

  useEffect(() => {
    //защита от перехватывающий маршрутов вроде /auth /feed
    if (refInitPathname.current !== pathname) return;
    const query = parseSearchParams(searchParams);
    recommendationsVideoStore.updateQuery(query);
  }, [searchParams, recommendationsVideoStore, pathname]);
};

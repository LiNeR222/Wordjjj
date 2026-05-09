import { RecommendationsVideoStore } from '@/entities/video/model/recommendationsVideoStore';
import { videosPerPage } from '../config';

export const recommendationsVideoStore =
  typeof window !== 'undefined'
    ? new RecommendationsVideoStore({
        category: 'video',
        limit: videosPerPage,
        sort_by: 'id',
      })
    : ({ initialized: false, items: [] } as unknown as RecommendationsVideoStore);

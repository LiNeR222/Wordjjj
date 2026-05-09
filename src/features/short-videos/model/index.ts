import { RecommendationsVideoStore } from '@/entities/video/model/recommendationsVideoStore';
import { shortsPerPage } from '../config';

export const recommendationsVideoStore = new RecommendationsVideoStore({
  category: 'shorts',
  limit: shortsPerPage,
});

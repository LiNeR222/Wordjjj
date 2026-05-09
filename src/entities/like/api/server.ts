import { SerializedError } from '@/shared/lib/serialized-error';
import { InitialData } from '@/shared/types';
import { LikeApi } from '.';
import { VideoLikes } from '../types';

export const fetchLikes = async (videoId: number): Promise<InitialData<VideoLikes>> => {
  try {
    const { getPublicLikes } = new LikeApi();
    const data = await getPublicLikes(videoId);
    return { data: data };
  } catch (error) {
    console.error('Error fetching likes:', error);
    return {
      error: SerializedError.toJSON(error as SerializedError),
    };
  }
};

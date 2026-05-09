import { SerializedError } from '@/shared/lib/serialized-error';
import { InitialData } from '@/shared/types';
import { VideoApi } from '.';
import { MyVideoList, PlaylistInfo, PlaylistVideos, Recommendations, Statistics, VideoDetailed, VideoRecommendationsQuery } from '../types';

//запрос выполняется на сервере next,
//поэтому каждый раз происходит создание нового экземпляра VideoApi
export const fetchVideoRecommendations = async (
  options: VideoRecommendationsQuery
): Promise<{ error?: string; data?: Recommendations }> => {
  try {
    const { getRecommendations } = new VideoApi();
    const data = await getRecommendations(options);
    return { data };
  } catch (error) {
    console.log('e', JSON.stringify(error));
    return { error: (error as SerializedError).message };
  }
};

export const fetchMyVideos = async ({ page }: { page: number }): Promise<InitialData<MyVideoList>> => {
  try {
    const { getMyVideos } = new VideoApi();
    return { data: await getMyVideos(page) };
  } catch (error) {
    console.log('error while fetching my videos', error);
    return {
      error: SerializedError.toJSON(error as SerializedError),
    };
  }
};

export const fetchMyStatistics = async (): Promise<InitialData<Statistics>> => {
  try {
    const { getMyStatistics } = new VideoApi();
    return { data: await getMyStatistics() };
  } catch (error) {
    console.log('error while fetching my  statistics', error);
    return {
      error: SerializedError.toJSON(error as SerializedError),
    };
  }
};

export const fetchPlaylistInfo = async (playlistId: number): Promise<InitialData<PlaylistInfo>> => {
  try {
    const { getPlaylistInfo } = new VideoApi();
    return { data: await getPlaylistInfo(playlistId) };
  } catch (error) {
    return {
      error: SerializedError.toJSON(error as SerializedError),
    };
  }
};

export const fetchPlaylistVideos = async (playlistId: number): Promise<InitialData<PlaylistVideos>> => {
  try {
    const { getPlaylistVideos } = new VideoApi();
    return { data: await getPlaylistVideos(playlistId) };
  } catch (error) {
    return {
      error: SerializedError.toJSON(error as SerializedError),
    };
  }
};

export const fetchVideoDetails = async (video_id: number): Promise<InitialData<VideoDetailed>> => {
  try {
    const { getDetailedVideo } = new VideoApi();
    return { data: await getDetailedVideo(video_id) };
  } catch (error) {
    console.log('error while fetching video details', error);
    return {
      error: SerializedError.toJSON(error as SerializedError),
    };
  }
};

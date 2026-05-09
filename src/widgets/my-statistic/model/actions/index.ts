import { Statistics } from '@/entities/video/types';

export const fetchStatistic = async (): Promise<{ error?: string; data?: Statistics }> => {
  try {
    /*const { getMyStatistics } = new VideoApi();
    const data = await getMyStatistics();
    return { data: data };*/
    return {
      data: {
        views: 2420,
        views_per: 20,
        registrations_referrals: 3000,
        registrations_utm: 200,
        registrations_per: 3,
        disk_usage: 2.42,
        disk_usage_per: -40,
        cost: 2.42,
        cost_per: -40,
        period: 'week',
      } as Statistics,
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { error: (error as Error).message };
  }
};

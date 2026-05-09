import { SerializedError } from '@/shared/lib/serialized-error';
import { UserApi } from '.';
import { UserResponse } from '../types';


export const getMyProfile = async (): Promise<{ error?: string; data?: UserResponse }> => {
  try {
    const { getMyProfile } = new UserApi();
    const data = await getMyProfile();
    return { data };
  } catch (error) {
    return { error: (error as SerializedError).message };
  }
};

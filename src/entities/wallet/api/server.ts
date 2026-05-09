import { SerializedError } from '@/shared/lib/serialized-error';
import { WalletApi, WalletBalance } from '.';

export const getWalletBalance = async (wallet_id: number): Promise<{ error?: string; data?: WalletBalance }> => {
  try {
    const data = await new WalletApi().getWalletBalance(wallet_id);
    return { data };
  } catch (error) {
    return { error: (error as SerializedError).message };
  }
}; 
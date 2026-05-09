'use client';

import { walletStore } from '@/entities/wallet';
import { authStore } from '@/entities/auth/model/authStore';
import { useEffect } from 'react';
import { Button } from '@/shared/ui';
import { observer } from 'mobx-react-lite';
import { FaWallet } from 'react-icons/fa';
import { useHydrationState } from '@/shared/lib/use-hydration-state';

export const BalanceButton = observer(({ ssrAuth }: { ssrAuth: boolean }) => {
  const { ammount, isLoading, refreshWalletData, openDepositModal } = walletStore;
  const { isAuth } = authStore;
  const isHydrated = useHydrationState();
  
  useEffect(() => {
    if (isAuth) {
      refreshWalletData();
    }
  }, [isAuth, refreshWalletData]);
  
  if ((!isHydrated && !ssrAuth) || (isHydrated && !isAuth)) {
    return null;
  }
  
  return (
    <Button 
      onClick={openDepositModal}
      className='flex items-center gap-1 px-3 max-[540px]:!px-[10px]'
      style={{ fontWeight: 500 }}
      disabled={isLoading}
    >
      <FaWallet fontSize={16} />
      <span className='max-[540px]:hidden'>
        Баланс <b>{isLoading ? '...' : ammount?.toLocaleString() ?? 0} ₽</b>
      </span>
    </Button>
  );
});
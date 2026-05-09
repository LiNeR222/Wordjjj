'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { useSearchAppParams } from '@/shared/hooks';
import { Button } from '@/shared/ui';
import { observer } from 'mobx-react-lite';
import { LiaCrownSolid } from 'react-icons/lia';
import { FiCheck } from 'react-icons/fi';

export const LogoPro = observer(() => {
  const { editSearchParams } = useSearchAppParams();
  const { isAuth, user } = authStore;
  
  const isPro = isAuth && user?.is_pro;

  if (isPro) {
    return (
      <Button
        className='max-[640px]:!px-[10px] bg-black hover:bg-black hover:text-white cursor-default'
        disabled
      >
        <FiCheck className='text-sm max-[640px]:text-lg mr-1' />
        <span className='inline max-[720px]:hidden'>Pro</span>
        <span className='min-[720px]:hidden max-[720px]:inline max-[540px]:hidden'>Pro</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        editSearchParams('add', [['modal', 'pro']]);
      }}
      className='max-[640px]:!px-[10px]'>
      <LiaCrownSolid className='text-sm max-[640px]:text-lg' />
      <span className='inline max-[720px]:hidden'>Перейти на Pro</span>
      <span className='min-[720px]:hidden max-[720px]:inline max-[540px]:hidden'>Pro</span>
    </Button>
  );
});

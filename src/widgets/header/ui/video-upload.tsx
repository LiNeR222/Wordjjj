'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { Button } from '@/shared/ui';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { PiPlus } from 'react-icons/pi';
export const VideoUpload = observer(({ ssrAuth }: { ssrAuth: boolean }) => {
  const { isAuth } = authStore;
  const isHydrated = useHydrationState();

  if ((!isHydrated && !ssrAuth) || (isHydrated && !isAuth)) {
    return null;
  }

  return (
    <Link href='/video/create'>
      <Button style={{ paddingInline: '9px' }} variant='dark' className='pl-[8px] max-[420px]:!px-[10px]'>
        <PiPlus fontSize={18} />
        <span className='inline max-[640px]:hidden'>Создать</span>
      </Button>
    </Link>
  );
});

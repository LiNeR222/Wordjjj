'use client';
import { authStore } from '@/entities/auth/model/authStore';
import { ProModal } from '@/features/pro-modal/index';
import { UploadVideoModal } from '@/features/upload-video-modal/index';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { LiaCrownSolid } from 'react-icons/lia';
import { PiPlus, PiQuestionLight } from 'react-icons/pi';
import { Button } from '../ui/button';
import { HeaderUser } from './user';

import { useSearchAppParams } from '@/shared/hooks';
//import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { usePathname } from 'next/navigation';

function Header() {
  //const isHydrated = useHydrationState();
  const { editSearchParams } = useSearchAppParams();
  const path = usePathname();
  const match = path.match(/^\/video\/(\d+)\/full$/);

  if (match) return null;

  return (
    <div className='sticky flex z-40 px-6 py-3 items-center justify-between bg-white gap-4'>
      <div className='text-black font-bold text-2xl'>
        <Link className='text-[28px] font-bold' href='/'>
          LOGO
        </Link>
      </div>
      <div className='flex gap-2 items-center justify-end'>
        <div className='flex items-center gap-2'>
          <Link className='flex max-[420px]:hidden' href='https://interesnoitochka.ru/api/v1/docs' target='_blank'>
            <PiQuestionLight fontSize={22} cursor='pointer' />
          </Link>
          <Button
            onClick={() => {
              editSearchParams('add', [['modal', 'pro']]);
            }}
            className='max-[640px]:!px-[10px]'>
            <LiaCrownSolid className='text-sm max-[640px]:text-lg' />
            <span className='inline max-[720px]:hidden'>Перейти на Pro</span>
            <span className='min-[720px]:hidden max-[720px]:inline max-[540px]:hidden'>Pro</span>
          </Button>
          <Button style={{ paddingInline: '8px' }} className='pl-[10px] max-[420px]:!px-[10px]'>
            <IoMdNotificationsOutline fontSize={18} />
          </Button>
          {authStore.isAuth && (
            <Button
              style={{ paddingInline: '9px' }}
              onClick={() => {
                editSearchParams('add', [['modal', 'upload']]);
              }}
              variant='dark'
              className='pl-[8px] max-[420px]:!px-[10px]'>
              <PiPlus fontSize={18} />
              <span className='inline max-[640px]:hidden'>Создать</span>
            </Button>
          )}
        </div>
        <HeaderUser />
      </div>
      <UploadVideoModal />
      <ProModal />
    </div>
  );
}

export default observer(Header);

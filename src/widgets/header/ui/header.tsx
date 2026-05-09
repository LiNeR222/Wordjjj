import { BalanceDepositModal } from '@/features/balance-deposit-modal';
import { ProModal } from '@/features/pro-modal/index';
import { UploadVideoModal } from '@/features/upload-video-modal/index';
import { headerHeight } from '@/shared/config';
// import { Button, Icon } from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
// import { IoMdNotificationsOutline } from 'react-icons/io';
import { PiQuestionLight } from 'react-icons/pi';
import { BalanceButton } from './balance-button';
import { LogoPro } from './logo-pro';
import { NavMenu } from './nav-menu';
import { VideoUpload } from './video-upload';

export const Header = async () => {
  const token = cookies().get('token')?.value;
  const isAuth = !!token;

  return (
    <div
      className={`sticky flex min-h-[${headerHeight}px] z-40 items-center justify-between px-2 sm:px-6 py-3 bg-white gap-4 w-full overflow-x-hidden`}>
      <div>
        <Link href='/' title='Перейти на главную страницу'>
          <Icon type='logo' className='w-9 h-9 text-black' />
        </Link>
      </div>
      <div className='flex gap-2 items-center justify-end'>
        <div className='flex items-center gap-2'>
          <Link className='flex max-[420px]:hidden' href='https://interesnoitochka.ru/api/v1/docs' target='_blank'>
            <PiQuestionLight fontSize={22} cursor='pointer' />
          </Link>
          <LogoPro />
          <BalanceButton ssrAuth={isAuth} />
          {/* <Button style={{ paddingInline: '8px' }} className='pl-[10px] max-[420px]:!px-[10px]'>
            <IoMdNotificationsOutline fontSize={18} />
          </Button> */}
          <VideoUpload ssrAuth={isAuth} />
        </div>
        <NavMenu />
      </div>
      <UploadVideoModal />
      <ProModal />
      <BalanceDepositModal />
    </div>
  );
};

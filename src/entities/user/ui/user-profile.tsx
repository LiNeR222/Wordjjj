'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { Divider } from '@/shared/ui/divider';
import { observer } from 'mobx-react-lite';
import { CurrentUserStoreContext } from '../lib/context';
import { AvatarUploader } from './avatar-uploader';
import { Phone } from './phone';
import { UserLogout } from './user-logout';
import { UsernameEditor } from './username-editor';

export const UserProfile = observer(() => {
  if (!authStore?.userStore) return null;
  return (
    <CurrentUserStoreContext.Provider value={authStore.userStore}>
      <div className='space-y-2'>
        <div className='flex flex-col items-center bg-gray-200 rounded-t-lg'>
          <AvatarUploader />
        </div>
        <div className='space-y-6 py-5 px-5'>
          <div className='flex flex-col items-center'>
            <div className={`w-full px-5 space-y-4`}>
              <UsernameEditor />
              <Phone />
              <Divider />
              <UserLogout />
            </div>
          </div>
        </div>
      </div>
    </CurrentUserStoreContext.Provider>
  );
});

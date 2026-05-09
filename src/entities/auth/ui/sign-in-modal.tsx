'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { observer } from 'mobx-react-lite';
import { createPortal } from 'react-dom';
import { BuyVideo } from './buy';
import { SignIn } from './sign-in';

export const SigninModal = observer(() => {
  const { signInOptions, isSignInModalOpen } = authStore;
  if (!isSignInModalOpen) return null;

  if (signInOptions?.extra?.action === 'buy') {
    return createPortal(<BuyVideo />, signInOptions.ref!.current!);
  }

  if (signInOptions?.ref?.current) {
    return createPortal(<SignIn />, signInOptions.ref.current);
  }

  return <SignIn />;
});

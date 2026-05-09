import { authStore } from '@/entities/auth/model/authStore';
import { SignIn } from '@/entities/auth/ui/sign-in';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const AuthError = observer(() => {
  const [show, setShow] = useState(false);
  const { authPromise, signIn } = authStore;
  const params = useParams<{ id: string }>();
  const videoId = params?.id;

  useEffect(() => {
    if (authPromise === null) {
      signIn(false, videoId);
    }
  }, [authPromise, signIn, videoId]);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[50] transition-opacity duration-400 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div
        className={clsx(
          `bg-white p-6 pt-8 rounded-2xl shadow-lg max-w-[350px] transform transition-all duration-400`,
          'max-[440px]:scale-50 max-[600px]:scale-60 max-md:scale-75 scale-100',
          {
            'opacity-100 scale-100': show,
            'opacity-0 scale-95': !show,
          }
        )}>
        <SignIn />
      </div>
    </div>
  );
});

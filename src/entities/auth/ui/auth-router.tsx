'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authRouteManager } from '../model/auth-route-manager';
import { AuthRoutes } from '../types';

export const AuthRouter = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = (route: AuthRoutes) => {
      router.push(route);
    };

    authRouteManager.on('redirect', handleRedirect);

    return () => {
      authRouteManager.off('redirect', handleRedirect);
    };
  }, [router]);

  return null;
};

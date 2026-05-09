'use client';

import { authStore } from '@/entities/auth/model/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    authStore.logout();
    router.replace('/');
  }, [router]);

  return null;
}

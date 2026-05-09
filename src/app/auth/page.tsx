'use client';

import { AuthModal } from '@/entities/auth/ui/auth-modal';
import { useHydrationState } from '@/shared/lib/use-hydration-state';

export default function AuthPage() {
  const isHydrated = useHydrationState();
  if (!isHydrated) return null;
  return <AuthModal />;
}

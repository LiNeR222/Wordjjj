'use client';

import { BuyModal } from '@/entities/auth/ui/buy-modal';
import { useHydrationState } from '@/shared/lib/use-hydration-state';

export default function BuyPage() {
  const isHydrated = useHydrationState();
  if (!isHydrated) return null;
  return <BuyModal />;
}

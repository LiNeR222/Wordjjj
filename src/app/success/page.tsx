'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHydrationState } from '@/shared/lib/use-hydration-state';
import { paymentStore } from '@/entities/payment';

function SuccessPageContent() {
  const router = useRouter();
  const isHydrated = useHydrationState();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (!isHydrated) return;
    
    const handleRedirect = async () => {
      const hasModalPro = searchParams.get('modal') === 'pro';
      
      await paymentStore.confirmPaymentSuccess();
      
      if (hasModalPro) {
        router.replace('/?modal=pro&success=true');
      } else {
        router.replace('/?success=true');
      }
    };
    
    handleRedirect();
  }, [isHydrated, router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Обработка платежа...</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
} 
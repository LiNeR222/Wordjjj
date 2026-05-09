'use client';

import React from 'react';
import { Button } from 'antd';
import { MdLock } from 'react-icons/md';
import { LiaCrownSolid } from 'react-icons/lia';
import { useSearchAppParams } from '@/shared/hooks/useSearchAppParams';

interface BlurredContentProps {
  isBlurred: boolean;
  children: React.ReactNode;
}

export const PremiumBlurOverlay: React.FC<BlurredContentProps> = ({ isBlurred, children }) => {
  const { editSearchParams } = useSearchAppParams();
  
  if (!isBlurred) {
    return <>{children}</>;
  }
  
  const handleOpenProModal = () => {
    editSearchParams('add', [['modal', 'pro']]);
  };

  return (
    <div className="relative bg-gray-50 rounded-lg p-4 mb-2 border border-gray-100">
      <div className="opacity-0 pointer-events-none">{children}</div>
      
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ filter: 'blur(10px)' }}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-lg overflow-hidden" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="bg-white/90 p-3 rounded-full shadow-lg mb-3">
          <MdLock size={24} className="text-gray-500" />
        </div>
        <p className="font-medium text-center text-gray-700 bg-white/80 px-4 py-2 rounded-full mb-4">
          Доступно в PRO-версии
        </p>
        
        <Button 
          onClick={handleOpenProModal}
          type="primary" 
          size="large"
          icon={<LiaCrownSolid />}
          className="bg-black hover:bg-gray-800 border-0 shadow-md"
        >
          Купить PRO-подписку
        </Button>
      </div>
    </div>
  );
}; 
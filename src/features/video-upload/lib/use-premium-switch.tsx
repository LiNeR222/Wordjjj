import { VideoDetailed } from '@/entities/video/types';
import { useEffect, useState } from 'react';
import { Switcher } from '../ui/switcher';

interface UsePremiumSwitchProps {
  isPro?: boolean;
  video?: VideoDetailed;
}

export const usePremiumSwitch = ({ video }: UsePremiumSwitchProps) => {
  const [isPremiumBlockVisible, setIsPremiumBlockVisible] = useState(false);

  useEffect(() => {
    if (video) {
      const hasPremiumFields = Boolean(video?.permission_rewind || (video?.time_not_pay && video?.time_not_pay > 0));
      setIsPremiumBlockVisible(hasPremiumFields);
    }
  }, [video]);

  const PremiumSwitch = () => {
    return (
      <Switcher 
        onSwitch={(value) => {
          setIsPremiumBlockVisible(value);
        }} 
        label='Премиум опции' 
        value={isPremiumBlockVisible} 
      />
    );
  };

  return { isPremiumBlockVisible, PremiumSwitch };
};

import { useState } from 'react';

export const useReloadPlayer = (player: React.RefObject<HTMLVmPlayerElement>, initialSrc: string) => {
  const [videoSrc, setVideoSrc] = useState(initialSrc);
  const [key, setKey] = useState(0);

  const reloadPlayer = async () => {
    if (player.current) {
      setVideoSrc('');
      setKey(prev => prev + 1);

      await new Promise(resolve => {
        setTimeout(() => {
          setVideoSrc(initialSrc); 
          setKey(prev => prev + 1); 
          resolve(true); 
        }, 100);
      });
    }
  };

  return { videoSrc, reloadPlayer, key };
};

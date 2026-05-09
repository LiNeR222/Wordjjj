import { PlayerStore } from '@/entities/video/model/player-store';
import { useIsMobile } from '@/shared/lib/use-is-mobile';
import { useEffect } from 'react';

export const useHandleMobileTogglePlay = ({
  isActive,
  player,
  isInteracted,
}: {
  isActive: boolean;
  player?: PlayerStore | null;
  isInteracted: boolean;
}) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!player || !isInteracted) return;

    const handleTogglePlay = () => {
      const isPaused = player.playerElement?.paused;
      if (isMobile) {
        if (isPaused && isActive) {
          player.play();
        } else {
          player.pause();
        }
      }
    };

    player.playerElement?.addEventListener('touchstart', handleTogglePlay);

    return () => {
      player.playerElement?.removeEventListener('touchstart', handleTogglePlay);
    };
  }, [isMobile, isActive, player, isInteracted]);
};

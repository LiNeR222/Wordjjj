import { PlayerStore } from '@/entities/video/model/player-store';
import { FC, useEffect } from 'react';
import { FaPlay } from 'react-icons/fa';

interface PlayIconProps {
  player: PlayerStore | null;
  isInteracted: boolean;
  isReady: boolean;
}

export const PlayIcon: FC<PlayIconProps> = ({ player, isInteracted, isReady }) => {
  useEffect(() => {
    if (player && isReady) {
      player.autoPlay();
    }
  }, [isReady, player]);

  if (isInteracted) return null;

  return (
    <button
      onClick={() => player?.play()}
      className='absolute left-1/2 top-1/2  -translate-x-1/2 -translate-y-1/2 flex items-center justify-center !z-[100] opacity-70 cursor-pointer hover:opacity-100 transition-opacity duration-300'>
      <FaPlay className='text-white text-[100px] ' />
    </button>
  );
};

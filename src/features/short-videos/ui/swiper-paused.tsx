import clsx from 'clsx';
import { IoMdPause } from 'react-icons/io';
import { Button } from './button';

interface SwiperPausedProps {
  isPaused?: boolean | null;
  play: () => void;
}

export const SwiperPaused = ({ isPaused, play }: SwiperPausedProps) => {
  if (!isPaused) return null;

  return (
    <div className={clsx('absolute z-30 top-2', 'sm:right-2', 'right-1')}>
      <Button onClick={() => play()}>
        <IoMdPause />
      </Button>
    </div>
  );
};

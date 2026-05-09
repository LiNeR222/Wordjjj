import { FC } from 'react';
import { type IconType, icons } from './icons';

interface StatsIconProps {
  className?: string;
  icon: string;
}

export const StatsIcon: FC<StatsIconProps> = ({ icon, className }) => {
  return (
    <div className={`rounded-xl flex items-center justify-center bg-black text-white ${className || ''}`}>{icons[icon as IconType]}</div>
  );
};

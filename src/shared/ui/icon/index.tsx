import { FC } from 'react';
import { type IconType, icons } from './icons';

interface StatsIconProps {
  className?: string;
  type: string;
}

export const Icon: FC<StatsIconProps> = ({ type, className }) => {
  return <div className={className}>{icons[type as IconType]}</div>;
};

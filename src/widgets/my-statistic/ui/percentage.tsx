import { makePercent } from '@/shared/lib/helpers';
import { FC } from 'react';
import { Period, periodLabels } from '../types';
import { type IconType, icons } from './icons';

interface StatsPercentageProps {
  value: number;
  className?: string;
  period: string;
}

export const StatsPercentage: FC<StatsPercentageProps> = ({ value, className, period }) => {
  const isPositive = value >= 0;

  const textColor = isPositive ? 'text-[#00B69B]' : 'text-[#F93C65]';
  const trendIcon = icons['trend' as IconType];

  return (
    <div className={`inline-flex items-center px-2 py-1 ${textColor}  ${className || ''}`}>
      <div className={`${isPositive ? '' : 'scale-y-[-1]'} mr-2`}>{trendIcon}</div>
      <div>{makePercent(value)}</div>
      <div className='ml-1 text-[#606060] font-semibold leading-5 tracking-tighter'>
        {periodLabels[period as Period]}
      </div>
    </div>
  );
};

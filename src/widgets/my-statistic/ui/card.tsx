import { FC } from 'react';
import { StatsIcon } from './icon';
import { NumberPairProps } from './number-pair';
// import { StatsPercentage } from './percentage';

interface StatsCardProps {
  title: string;
  value: string | React.ReactElement<NumberPairProps>;
  percentage: number;
  icon: string;
  avatars?: number;
  period?: string;
}

// export const StatsCard: FC<StatsCardProps> = ({ title, value, percentage, icon, period = 'all' }) => {
export const StatsCard: FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <div className='relative flex flex-col box-content bg-white rounded-2xl shadow-lg p-4 gap-3 h-[6.5rem] '>
      <div className='text-base font-semibold leading-5 tracking-tighter text-gray-800 opacity-70'>{title}</div>
      <div className={`text-2xl font-bold text-gray-800 tracking-[-0.04em]`}>{value}</div>
      {/* <StatsPercentage className='mt-auto' value={percentage} period={period} /> */}
      <StatsIcon className='absolute top-4 right-4 w-10 h-10' icon={icon} />
    </div>
  );
};

import { formatTimeAgo } from '@/shared/lib/formatTimeAgo';
import { FC } from 'react';

interface TimeAgoProps {
  date: string;
}

export const TimeAgo: FC<TimeAgoProps> = ({ date }) => {
  const timeAgo = formatTimeAgo(date);
  return <span className='text-gray-400 text-[0.75rem]'>{timeAgo}</span>;
};

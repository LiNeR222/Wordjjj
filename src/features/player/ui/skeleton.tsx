'use client';
import { Skeleton } from '@/shared/ui/skeleton';

export const VideoSkeleton = () => {
  return (
    <Skeleton.Node active className='w-full h-full'>
      <div className='w-full h-full bg-gray-200 rounded-xl' />
    </Skeleton.Node>
  );
};

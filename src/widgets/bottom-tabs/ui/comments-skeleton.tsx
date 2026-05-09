import { Skeleton } from '@/shared/ui/skeleton';

export const SkeletonComments = () => {
  return (
    <div className='flex flex-col gap-8 w-full'>
      <div className='flex gap-4 w-full'>
        <Skeleton.Avatar active size='large' />
        <Skeleton.Input active size='large' style={{ width: '100%' }} className='flex-1' />
      </div>
      <Skeleton active avatar paragraph={{ rows: 2 }} />
      <Skeleton active avatar paragraph={{ rows: 2 }} />
    </div>
  );
};

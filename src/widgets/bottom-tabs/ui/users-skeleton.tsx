import { Skeleton } from '@/shared/ui/skeleton';

const rows = Array.from({ length: 6 }).map((_, index) => (
  <div key={index} className='flex gap-4'>
    <Skeleton.Avatar active size='default' />
    <Skeleton.Input active size='default' style={{ width: 200 }} />
    <Skeleton.Input active size='default' style={{ width: 200 }} />
    <Skeleton.Input active size='default' style={{ width: '100%' }} className='flex-1' />
  </div>
));

export const SkeletonUsers = () => {
  return (
    <div className='w-full flex flex-col gap-6'>
      <Skeleton.Input active size='default' style={{ width: 200 }} />
      {rows}
    </div>
  );
};

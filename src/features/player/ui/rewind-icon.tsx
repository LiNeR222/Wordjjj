import { Icon } from '@/shared/ui';

export const RewindIcon = ({ type }: { type: 'forward' | 'backward' }) => {
  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <div className='bg-black bg-opacity-75 rounded-full p-4'>
        <Icon type={type === 'forward' ? 'fast-forward' : 'fast-backward'} className='text-white text-4xl' />
      </div>
    </div>
  );
};

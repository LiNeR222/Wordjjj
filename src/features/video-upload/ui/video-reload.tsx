import { Button } from '@/shared/ui/button/button';
import { useController, useFormContext } from 'react-hook-form';
import { FaCheckCircle } from 'react-icons/fa';
import { FormValues } from '../types';

export const VideoReload = () => {
  const { control } = useFormContext<FormValues>();
  const { field } = useController({ control, name: 'video_id' });

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex flex-col items-center content-center justify-center gap-y-1 bg-gray-100 p-4 rounded-xl h-[140px]'>
        <div className='flex items-center'>
          <FaCheckCircle className='text-green-500 mr-2' />
          <h3 className='text-xl font-semibold text-gray-800'>Видео загружено</h3>
        </div>
      </div>
      <Button
        onClick={() => {
          field.onChange(null);
        }}
        type='primary'
        size='middle'
        variant='solid'
        color='default'
        block>
        Изменить видео (загрузить новое)
      </Button>
    </div>
  );
};

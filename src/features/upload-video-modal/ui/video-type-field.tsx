import { Radio } from 'antd';
import { useController, UseControllerProps } from 'react-hook-form';
import { ISubmitData } from '../types';

function VideoTypeField(props: UseControllerProps<ISubmitData, 'videoType'>) {
  const {
    field,
    fieldState: { error },
  } = useController(props);

  return (
    <div className='w-full flex flex-col gap-y-2'>
      <p className='text-ml font-semibold'>Тип видео</p>
      <Radio.Group
        value={field.value}
        onChange={field.onChange}
        className='flex flex-col gap-y-2 ml-1'
      >
        <Radio value='public'>
          <span className='font-medium'>Открытый</span>
          <p className='text-xs text-gray-500'>Видео будет доступно всем</p>
        </Radio>
        <Radio value='link'>
          <span className='font-medium'>По ссылке</span>
          <p className='text-xs text-gray-500'>Видео будет доступно только по прямой ссылке</p>
        </Radio>
        <Radio value='private'>
          <span className='font-medium'>Закрытый</span>
          <p className='text-xs text-gray-500'>Видео будет доступно только вам</p>
        </Radio>
      </Radio.Group>
      {error && <p className='text-red-500'>{error.message}</p>}
    </div>
  );
}

export default VideoTypeField; 
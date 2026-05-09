import { Radio } from 'antd';
import { useController, useFormContext } from 'react-hook-form';
import { FormValues } from '../types';

export const VideoTypeField = () => {
  const { control } = useFormContext<FormValues>();
  const {
    field,
    fieldState: { error },
  } = useController({ name: 'format_video', control });

  const config: Record<string, string[]> = {
    public: ['Открытый', 'Видео будет доступно всем'],
    link: ['По ссылке', 'Видео будет доступно только по прямой ссылке'],
    private: ['Закрытый', 'Видео будет доступно только вам'],
  };

  const options = Object.entries(config).map(([key, value]) => ({
    label: (
      <>
        <span className='font-medium'>{value[0]}</span>
        <p className='text-xs text-gray-500'>{value[1]}</p>
      </>
    ),
    value: key,
  }));

  return (
    <div className='w-full flex flex-col gap-y-2'>
      <p className='text-ml font-semibold'>Тип видео</p>
      <Radio.Group
        value={field.value}
        onChange={field.onChange}
        options={options}
        className='flex flex-col gap-y-2 ml-1'></Radio.Group>
      {error && <p className='text-red-500'>{error.message}</p>}
    </div>
  );
}

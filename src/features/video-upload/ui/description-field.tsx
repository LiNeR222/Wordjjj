import { useController, useFormContext } from 'react-hook-form';
import { FormValues } from '../types';

export const DescriptionField = () => {
  const { control } = useFormContext<FormValues>();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: 'description', rules: { required: 'Описание видео обязательное поле' } });

  return (
    <div className='w-full'>
      <div className='border-gray-300 focus:border-gray-300 border rounded-xl transition-all cursor-pointer hover:border-gray-500'>
        <p className='px-3 pt-1 text-xs'>Описание видео</p>
        <textarea
          {...field}
          className='flex min-h-[100px] px-3 pt-0 py-1 w-full text-base outline-none rounded-xl'
          placeholder='Введите описание видео'
        />
      </div>
      {error && <span className='text-red-500 text-xs'>{error.message}</span>}
    </div>
  );
};

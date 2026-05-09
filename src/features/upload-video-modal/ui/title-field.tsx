import { useController, UseControllerProps } from 'react-hook-form';
import { ISubmitData } from '../types';

function TitleField(props: UseControllerProps<ISubmitData, 'title'>) {
  const {
    field,
    fieldState: { error: errors },
  } = useController(props);

  return (
    <div className='w-full'>
      <div className='border-gray-300 focus:border-gray-300 border rounded-xl transition-all cursor-pointer hover:border-gray-500'>
        <p className='px-3 pt-1 text-xs'>Название видео</p>
        <input
          type='text'
          placeholder='Введите название видео'
          className='px-3 pt-0 py-1 w-full text-base outline-none rounded-xl'
          {...field}
          value={field.value || ''}
        />
      </div>
      {errors && <span className='text-red-500 text-xs'>{errors.message}</span>}
    </div>
  );
}

export default TitleField;

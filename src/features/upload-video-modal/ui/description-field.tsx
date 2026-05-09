import { useController, UseControllerProps } from 'react-hook-form';
import { ISubmitData } from '../types';

// interface IDescriptionProps {
//   register: UseFormRegister<ISubmitData>;
//   errors: FieldErrors<ISubmitData>;
// }

function DescriptionField(props: UseControllerProps<ISubmitData, 'description'>) {
  const {
    field,
    fieldState: { error: errors },
  } = useController(props);

  return (
    <div className='w-full'>
      <div className='border-gray-300 focus:border-gray-300 border rounded-xl transition-all cursor-pointer hover:border-gray-500'>
        <p className='px-3 pt-1 text-xs'>Описание видео</p>
        <textarea
          {...field}
          className='flex min-h-[100px] px-3 pt-0 py-1 w-full text-base outline-none rounded-xl'
          placeholder='Введите описание видео'
          // {...register('description', { required: 'Описание видео обязательное поле' })}
        />
      </div>
      {errors && <span className='text-red-500 text-xs'>{errors.message}</span>}
    </div>
  );
}

export default DescriptionField;

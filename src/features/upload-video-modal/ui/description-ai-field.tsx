import { useController, UseControllerProps } from 'react-hook-form';
import { ISubmitData } from '../types';

// interface IDescriptionAIProps {
//   register: UseFormRegister<ISubmitData>;
//   errors: FieldErrors<ISubmitData>;
// }

function DescriptionAIField(props: UseControllerProps<ISubmitData, 'metadata_ai_description'>) {
  const {
    field,
    fieldState: { error: errors },
  } = useController(props);

  return (
    <div className='w-full'>
      <div className='flex flex-col relative border-gray-300 focus:border-gray-300 border rounded-xl transition-all cursor-pointer hover:border-gray-500'>
        <p className='px-3 pt-1 text-xs'>Описание с ИИ</p>
        <textarea
          className='flex min-h-[100px] px-3 pt-0 py-1 w-full text-base outline-none rounded-xl'
          placeholder='Введите описание с помощью ИИ'
          {...field}
          // {...register('metadata_ai_description', {  })}
        />
        <div className='flex absolute top-3 right-3 cursor-pointer p-1 border border-gray-300 rounded transition-all hover:border-gray-400'>
          <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M8 5L7.484 6.394C6.808 8.222 6.47 9.136 5.803 9.803C5.136 10.47 4.222 10.808 2.394 11.484L1 12L2.394 12.516C4.222 13.192 5.136 13.531 5.803 14.197C6.47 14.863 6.808 15.778 7.484 17.606L8 19L8.516 17.606C9.192 15.778 9.531 14.864 10.197 14.197C10.863 13.53 11.778 13.192 13.606 12.516L15 12L13.606 11.484C11.778 10.808 10.864 10.47 10.197 9.803C9.53 9.136 9.192 8.222 8.516 6.394L8 5ZM16 1L15.779 1.597C15.489 2.381 15.344 2.773 15.059 3.058C14.773 3.344 14.381 3.489 13.597 3.778L13 4L13.598 4.221C14.381 4.511 14.773 4.656 15.058 4.941C15.344 5.227 15.489 5.619 15.778 6.403L16 7L16.221 6.403C16.511 5.619 16.656 5.227 16.941 4.942C17.227 4.656 17.619 4.511 18.403 4.222L19 4L18.402 3.779C17.619 3.489 17.227 3.344 16.942 3.059C16.656 2.773 16.511 2.381 16.222 1.597L16 1Z'
              stroke='black'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
      </div>
      {errors && <span className='text-red-500 text-xs'>{errors.message}</span>}
    </div>
  );
}

export default DescriptionAIField;

import { useController, UseControllerProps } from 'react-hook-form';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { ISubmitData } from '../types';

interface RewindFieldProps extends UseControllerProps<ISubmitData, 'timeNo.pay' | 'timeNo.reg'> {
  label: string;
  minValue?: number;
}

function RewindField(props: RewindFieldProps) {
  const { field } = useController(props);
  const { label, minValue = 0 } = props;
  
  return (
    <div className='w-full flex flex-col gap-y-4'>
      <div className='w-full relative border border-gray-300 rounded-xl p-2 flex flex-row'>
        <div className='flex flex-col flex-grow pr-2 pl-1'>
          <p className='text-xs'>
            {label} <span className='text-gray-500'>(сек.)</span>
          </p>
          <div className='flex items-center justify-between'>
            <input
              type='text'
              {...field}
              onChange={event => {
                const value = Number(event.target.value.replace(/[^0-9]/g, ''));
                const newValue = Math.max(minValue, value);
                field.onChange(newValue);
              }}
              className='w-full text-base outline-none bg-transparent'
            />
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <button
            onClick={() => {
              field.onChange(Number(field.value) + 1);
            }}
            className='border border-gray-300 rounded px-2 sm:px-3 py-1 flex items-center justify-center'>
            <FaCaretUp size={12} />
          </button>
          <button
            onClick={() => {
              field.onChange(Math.max(minValue, Number(field.value) - 1));
            }}
            className='border border-gray-300 rounded px-2 sm:px-3 py-1 flex items-center justify-center'>
            <FaCaretDown size={12} />
          </button>
        </div>
      </div>
      {minValue > 0 && (
        <p className='text-xs text-gray-500 -mt-3 ml-1'>
          Минимальное значение: {minValue} сек.
        </p>
      )}
    </div>
  );
}

export default RewindField;

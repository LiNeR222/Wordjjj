import { useDidUpdate } from '@/shared/lib/use-update-effect';
import { Switch } from 'antd';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { FormValues } from '../types';

interface RewindFieldProps {
  name: 'time_not_reg' | 'time_not_pay';
}

export const RewindField: FC<RewindFieldProps> = ({ name }) => {
  const { control, watch, setValue, trigger } = useFormContext<FormValues>();
  const time_not_reg = watch('time_not_reg');

  const {
    field: { value, ...restField },
    fieldState: { error },
  } = useController({
    control,
    name,
    rules: {
      validate: value =>
        value && time_not_reg ? value >= time_not_reg || `Минимальное значение: ${time_not_reg} сек.` : true,
    },
  });
  const [useField, setUseField] = useState(value !== null);
  const [minValue, setMinValue] = useState(0);

  useEffect(() => {
    trigger('time_not_pay');
  }, [time_not_reg, trigger, value]);

  const config: Record<string, { label: string }> = {
    time_not_reg: { label: 'Макс. время просмотра для незарегистрированных пользователей' },
    time_not_pay: { label: 'Макс. время просмотра для пользователей без оплаты' },
  };


  useEffect(() => {
    if (restField.name === 'time_not_pay') {
      setMinValue(time_not_reg ?? 0);
    }
  }, [restField.name, time_not_reg]);

  useDidUpdate(() => {

    if (useField) {
      setValue(name, Number(value));
    } else {
      setValue(name, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useField]);

  return (
    <div className='w-full flex flex-col gap-y-4'>
      <div
        className={clsx('w-full relative border border-gray-300 rounded-xl p-2 flex flex-row', {
          'bg-gray-50': !useField,
        })}>
        <div className='flex flex-col flex-grow pr-2 pl-1'>
          <p className='text-xs'>
            {<Switch size='small' checked={useField} onChange={setUseField} />} {config[name].label}{' '}
            <span className='text-gray-500'>(сек.)</span>
          </p>
          <div className='flex items-center justify-between'>
            {useField && (
              <input
                type='text'
                value={value ?? 0}
                {...restField}
                onChange={event => {
                  restField.onChange(Math.max(minValue, parseInt(event.target.value, 10) || 0));
                }}
                className='w-full text-base outline-none bg-transparent'
              />
            )}
          </div>
        </div>

        <div className={clsx('flex flex-col gap-1', { 'opacity-50 pointer-events-none': !useField })}>
          <button
            type='button'
            onClick={() => {
              restField.onChange(Number(value) + 1);
            }}
            className='border border-gray-300 rounded px-2 sm:px-3 py-1 flex items-center justify-center'>
            <FaCaretUp size={12} />
          </button>
          <button
            type='button'
            onClick={() => {
              restField.onChange(Math.max(minValue, Number(value) - 1));
            }}
            className='border border-gray-300 rounded px-2 sm:px-3 py-1 flex items-center justify-center'>
            <FaCaretDown size={12} />
          </button>
        </div>
      </div>
      {!error && useField && minValue > 0 && (
        <p className='text-xs text-gray-500 -mt-3 ml-1'>Минимальное значение: {minValue} сек.</p>
      )}
      {error && useField && <p className='text-xs text-red-500 -mt-3 ml-1'>{error.message}</p>}
    </div>
  );
};

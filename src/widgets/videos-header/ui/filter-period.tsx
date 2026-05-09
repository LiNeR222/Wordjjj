import { Radio, type RadioChangeEvent } from '@/shared/ui/radio';
import { observer } from 'mobx-react-lite';
import { memo } from 'react';
import { videoHeaderStore } from '../model/video-header-store';

const periodOptions = [
  { value: '', label: 'Неважно' },
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
];

export const FilterPeriod = memo(
  observer(() => {
    const {
      filters: { date_period },
      updateFilters,
    } = videoHeaderStore;

    const handleOptionChange = (e: RadioChangeEvent) => {
      updateFilters({ date_period: e.target.value });
    };

    return (
      <div className=''>
        <h4 className='text-lg font-semibold tracking-[-0.4px] text-gray-800 mb-2'>Дата загрузки</h4>
        <Radio.Group value={date_period} onChange={handleOptionChange} className='flex flex-col gap-1'>
          {periodOptions.map(option => (
            <Radio
              key={option.value}
              value={option.value}
              className='text-lg text-gray-700 hover:bg-gray-200 py-0.5 px-2 rounded-xl transition-all duration-200'>
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </div>
    );
  })
);

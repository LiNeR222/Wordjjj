import { Radio, type RadioChangeEvent } from '@/shared/ui/radio';
import { observer } from 'mobx-react-lite';
import { memo } from 'react';
import { videoHeaderStore } from '../model/video-header-store';
const paymentOptions = [
  { value: '', label: 'Неважно' },
  { value: 'true', label: 'Бесплатные' },
  { value: 'false', label: 'Платные' },
];

export const FilterPayment = memo(
  observer(() => {
    const {
      filters: { is_free },
      updateFilters,
    } = videoHeaderStore;

    const handleOptionChange = (e: RadioChangeEvent) => {
      updateFilters({ is_free: e.target.value });
    };

    return (
      <div className=''>
        <h4 className='text-lg font-semibold tracking-[-0.4px] text-gray-800 mb-2'>Категория оплаты</h4>
        <Radio.Group value={is_free} onChange={handleOptionChange} className='flex flex-col gap-1'>
          {paymentOptions.map(option => (
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

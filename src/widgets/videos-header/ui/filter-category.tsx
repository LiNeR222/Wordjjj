import { Radio, type RadioChangeEvent } from '@/shared/ui/radio';
import { observer } from 'mobx-react-lite';
import { memo } from 'react';
import { videoHeaderStore } from '../model/video-header-store';

const options = [
  { value: '', label: 'Все' },
  { value: 'video', label: 'Видео' },
  { value: 'shorts', label: 'Шортс' },
  // { value: 'audio', label: 'Аудио' },
];

export const FilterCategory = memo(
  observer(() => {
    //prettier-ignore
    const { filters: { category }, updateFilters } = videoHeaderStore;

    const handleOptionChange = (e: RadioChangeEvent) => {
      updateFilters({ category: e.target.value });
    };

    return (
      <Radio.Group
        block
        optionType='button'
        buttonStyle='solid'
        options={options}
        value={category}
        onChange={handleOptionChange}
        className='font-semibold tracking-[-0.4px]'
        size='large'
      />
    );
  })
);

import { Select } from 'antd';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { memo } from 'react';
import { videoHeaderStore } from '../model/video-header-store';

const categories = [
  { value: '', label: 'Новые' },
  { value: 'views', label: 'Популярные' },
];

export const Sort = memo(
  observer(({ className }: { className?: string }) => {
    const {
      filters: { sort_by },
      updateFilters,
    } = videoHeaderStore;

    const handleOptionChange = (value: string) => {
      updateFilters({ sort_by: value });
    };

    return (
      <div className={clsx('flex flex-row gap-2 items-center', className)}>
        <div className='text-lg  whitespace-nowrap'>Сначала</div>
        <Select
          value={sort_by as string}
          onChange={handleOptionChange}
          options={categories}
          placeholder='Сортировать по'
          style={{ width: '100%' }}
          className='h-9'
          popupClassName='[&_.ant-select-item]:!rounded-xl [&_.ant-select-item]:text-md'
        />
      </div>
    );
  })
);

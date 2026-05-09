'use client';

import { Badge } from '@/components/ui';
import { useSearchAppParams } from '@/shared/hooks';
import { useEffect, useState } from 'react';

interface Category {
  name: string;
  value: string;
}

const CATEGORIES: Category[] = [
  { name: 'Все', value: 'all' },
  { name: 'Видео', value: 'video' },
  { name: 'Аудио', value: 'audio' },
  { name: 'Шортс', value: 'shorts' },
];

export const MainCatalogCategory = () => {
  const { editSearchParams, getSearchParamValue } = useSearchAppParams();
  const [categoryValue, setCategoryValue] = useState(getSearchParamValue('category') || 'all');

  useEffect(() => {
    if (!CATEGORIES.find(category => category.value === getSearchParamValue('category'))) {
      setCategoryValue('all');
      editSearchParams('add', [['category', 'all']]);
    }
  }, [getSearchParamValue, editSearchParams]);

  return (
    <ul className='w-full flex gap-3 flex-wrap'>
      {CATEGORIES.map(category => (
        <li key={category.value}>
          <Badge
            size='large'
            color={category.value === categoryValue ? 'blue' : 'default'}
            onClick={() => {
              setCategoryValue(category.value);
              editSearchParams('add', [['category', category.value]]);
            }}>
            {category.name}
          </Badge>
        </li>
      ))}
    </ul>
  );
};

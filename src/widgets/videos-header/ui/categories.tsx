'use client';

import { Badge } from '@/components/ui';
import { VideoCategory } from '@/entities/video/types';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';
import { RiEqualizerFill } from 'react-icons/ri';
import { categories } from '../config';
import { videoHeaderStore } from '../model/video-header-store';
import { FilterTrigger } from './filter-trigger';

interface CategoriesProps {
  category?: VideoCategory;
  hasFilters: boolean;
}
//ToDo При нажатии на категорию в шапке, добавляется фильтр в хранилище шапки и счетчик примененных фильтров увеличивается на 1.
//Нужно исправить чтобы категории не учитывались в счетчике примененных фильтров
export const Categories: FC<CategoriesProps> = observer(({ category: defaultCategory = 'all', hasFilters }) => {
  const { isSearchActive } = videoHeaderStore;
  const searchParams = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams.toString());

  return (
    <ul
      className={clsx(
        `flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 flex-grow min-w-0 min-h-9`,
        isSearchActive && 'hidden'
      )}>
      {categories.map(category => {
        const isChats = category.key === 'chats';

        if (!isChats) {
          if (category.key !== 'all') {
            newSearchParams.set('category', category.key);
          } else {
            newSearchParams.delete('category');
          }
        }

        const href = isChats ? category.href : `?${newSearchParams.toString()}`;

        return (
          <li key={category.key}>
            <Link
              href={href}
              className={clsx('cursor-pointer', !isChats && defaultCategory === category.key && 'pointer-events-none')}>
              <Badge size='large' color={!isChats && defaultCategory === category.key ? 'blue' : 'default'} className=''>
                {category.label}
              </Badge>
            </Link>
          </li>
        );
      })}
      {hasFilters && (
        <li>
          <FilterTrigger>
            <Badge size='large' className='flex items-center'>
              <RiEqualizerFill fontSize={14} />
            </Badge>
          </FilterTrigger>
        </li>
      )}
    </ul>
  );
});

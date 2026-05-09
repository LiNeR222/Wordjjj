import { RecommendationsSearchParams, videoRecommendationsKeys } from '@/entities/video/types';
import { ConfigProvider } from 'antd';
import { FC, useMemo } from 'react';
import { theme } from '../config';
import { Categories } from './categories';
import { FilterControl } from './filter-control';
import { SearchControl } from './search-control';

export const VideosHeader: FC<RecommendationsSearchParams> = searchParams => {
  const hasFilters = useMemo(() => videoRecommendationsKeys.some(key => key in searchParams), [searchParams]);

  return (
    <div className='flex flex-row justify-between items-start gap-3'>
      <ConfigProvider theme={theme}>
        <Categories category={searchParams.category} hasFilters={hasFilters} />
        <SearchControl q={searchParams.q} />
        <FilterControl />
      </ConfigProvider>
    </div>
  );
};

'use client';

import { myVideoStore } from '@/entities/video/model/my-video-store';
import { MyVideoList } from '@/entities/video/types';
import { useSearchAppParams } from '@/shared/hooks';
import Pagination from '@/shared/ui/pagination';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { GridView } from './grid-view';

interface MyVideosProps {
  initialData?: MyVideoList;
  page: number;
}

export const MyVideos: FC<MyVideosProps> = observer(({ page = 1 }) => {
  const { totalPages, items: videos, setPage } = myVideoStore;
  const { editSearchParams } = useSearchAppParams();

  useEffect(() => setPage(page), [page, setPage]);

  const handlePageChange = (newPage: number) => {
    editSearchParams('add', [['page', String(newPage)]]);
  };

  return (
    <div className='overflow-x-auto rounded-lg overflow-hidden border-[0.6px] border-gray-300 shadow-2xl bg-white'>
      <GridView videos={videos} />
      <div className='flex justify-between items-center py-4 px-5'>
        <span className='text-sm text-gray-800 font-medium opacity-60'>{`Страница ${page ?? 1} из ${totalPages ?? (page || 1)}`}</span>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          showPageButtons={false}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
});

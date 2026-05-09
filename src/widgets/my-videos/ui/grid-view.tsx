import { myVideoStore } from '@/entities/video/model/my-video-store';
import { MyVideo } from '@/entities/video/types';
import { VideoStatsRow } from '@/entities/video/ui/video-statistic-row';
import { Spin } from '@/shared/ui/spin';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';

interface GridViewProps {
  videos?: MyVideo[];
}

export const GridView: FC<GridViewProps> = observer(({ videos = [] }) => {
  const { loading } = myVideoStore;

  return (
    <table className='w-full border-collapse'>
      <thead className='h-12 p-4 bg-[#FCFDFD] border-b-[0.4px] border-gray-300'>
        <tr>
          <th className='p-2 w-[9rem] text-left rounded-tl-lg pl-9'>Превью</th>
          <th className='p-2 w-64 text-left'>Название</th>
          <th className='p-2 w-24 text-left'>Длительность</th>
          <th className='p-2 w-24 text-left'>Просмотры</th>
          <th className='p-2 w-32 text-left'>Рефералы</th>
          <th className='p-2 w-32 text-left'>Размер файла</th>
          <th className='p-2 w-40 text-left'>Статус обработки</th>
          <th className='p-2 w-24 text-left rounded-tr-lg pr-9'>Стоимость</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={8} className='p-5 text-center'>
              <Spin />
            </td>
          </tr>
        ) : videos.length ? (
          videos?.map(video => <VideoStatsRow key={video.video_id} video={video} />)
        ) : (
          <tr>
            <td colSpan={8} className='p-5 text-center'>
              <span className='text-gray-800 font-medium opacity-60'>Видео не найдены</span>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
});

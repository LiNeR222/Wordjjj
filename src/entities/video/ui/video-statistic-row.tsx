import { resolveImageURL } from '@/shared/lib';
import { formatBytes, formatDuration, markDigitPlace } from '@/shared/lib/helpers';
import { Icon } from '@/shared/ui/icon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { GrView } from 'react-icons/gr';
import { useDoubleTap } from 'use-double-tap';
import { MyVideo } from '../types';
import { ContextMenu } from './context-menu';
import { Preview } from './preview';
import { VideoProcessingStatusComponent } from './video-processing-status';
interface VideoStatsRowProps {
  video: MyVideo;
}

export const VideoStatsRow: FC<VideoStatsRowProps> = ({
  video: {
    video_id,
    title,
    preview_image,
    cost_video = 0,
    file_size = 0,
    numbers_views = 0,
    referrals = 0,
    duration_sec = 0,
  },
}) => {
  const router = useRouter();
  
  const handleRowDoubleTap = useDoubleTap(() => {
    router.push(`/video/${video_id}/edit`);
  });

  return (
    <tr
      className='hover:bg-gray-50 transition-colors text-sm text-gray-800 font-medium border-b-[0.4px] border-gray-300'
      {...handleRowDoubleTap}>
      {/* Превью видео */}
      <td className='p-2 pl-9'>
        <Link href={`/video/${video_id}`}>
          <div className='relative flex items-center justify-center w-24 h-16 cursor-pointer'>
            <Preview
              fill={true}
              sizes='(max-width: 768px) 50vw, 30vw'
              className='w-full rounded-xl shadow object-cover'
              src={resolveImageURL(preview_image, video_id)}
              alt={title}
            />
          </div>
        </Link>
      </td>

      {/* Название видео */}
      <td className='p-2 max-w-64 truncate overflow-hidden ellipsis'>{title}</td>

      {/* Длительность */}
      <td className='p-2'>
        <div className='flex items-center gap-1'>
          <Icon type='watch-forward' className='w-4 h-4' />
          <span>{formatDuration(duration_sec)}</span>
        </div>
      </td>

      {/* Количество просмотров */}
      <td className='p-2'>
        <div className='flex items-center gap-1'>
          <GrView fontSize={16} />
          <span>{markDigitPlace(numbers_views)}</span>
        </div>
      </td>

      {/* Количество рефералов */}
      <td className='p-2'>
        <div className='flex items-center gap-1'>
          <Icon type='users' className='w-4 h-4' />
          <span>{markDigitPlace(referrals)}</span>
        </div>
      </td>

      {/* Размер файла */}
      <td className='p-2'>
        <div className='flex items-center gap-1'>
          <Icon type='file' className='w-4 h-4' />
          <span>{formatBytes(file_size)}</span>
        </div>
      </td>

      {/* Статус обработки */}
      <td className='p-2'>
        <div className='flex items-center gap-1 max-w-[150px]'>
          <VideoProcessingStatusComponent videoId={video_id} />
        </div>
      </td>

      {/* Стоимость видео */}
      <td className='p-2'>
        <div className='flex items-center gap-1'>
          <Icon type='dollar' className='w-4 h-4' />
          <span>{markDigitPlace(cost_video)}</span>
          <div className='ml-auto pr-2'>
            <ContextMenu video_id={video_id} />
          </div>
        </div>
      </td>
    </tr>
  );
};

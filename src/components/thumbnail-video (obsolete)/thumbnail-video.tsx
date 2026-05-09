'use client';
import { ChannelAvatar } from '@/entities/channel/ui/channel_avatar';
import { getPreviewVideo } from '@/shared/lib/getVideoPreview';
import clsx from 'clsx';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { useMediaQuery } from 'usehooks-ts';
import styles from './styles.module.css';
export interface IThumbnailVideo {
  video_id: number;
  title?: string;
  preview_image: string;
  channel_id: number;
  channel_name: string;
  channel_avatar: string;
  numbers_views: number;
  duration_sec: number;
  free: boolean;
  seo_url: string;
  vertical: boolean;
  date_publication: string;
}

export function ThumbnailVideo({
  video_id,
  title = '',
  channel_id,
  channel_name,
  channel_avatar,
  numbers_views,
  duration_sec,
  free,
  date_publication,
}: IThumbnailVideo) {
  const public_date = new Date(date_publication);
  const router = useRouter();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [previewSrc, setPreviewSrc] = useState<string>(() => getPreviewVideo(video_id));
  return (
    <div className='flex justify-center w-full h-full py-2 sm:py-0'>
      <div
        onClick={() => router.push(`/video/${video_id}`)}
        className='flex flex-col gap-y-2 cursor-pointer rounded-2xl sm:hover:bg-gray-100 px-0 sm:p-2  w-full h-full'>
        <div className='relative w-full aspect-video object-cover bg-black rounded-2xl overflow-hidden'>
          <Image
            onError={() => setPreviewSrc('/images/preview_video_stub.jpg')}
            className='object-contain w-full aspect-video'
            width={1600}
            height={900}
            src={previewSrc}
            alt='Thumbnail'
          />
          <span className='absolute text-xs bg-black px-1 rounded-xl bottom-2 right-2 text-white'>
            {`${Math.floor(duration_sec / 60)}:${String(duration_sec % 60).padStart(2, '0')}`}
          </span>
          {!free && (
            <p className='absolute flex items-center text-xs bg-black gap-x-1 px-1 rounded-md top-2 left-2 text-white'>
              <MdOutlineAttachMoney />
              Платное
            </p>
          )}
        </div>

        <div className='flex flex-row gap-x-2'>
          <div className='flex-shrink-0'>
            <Link href={`/${channel_id}`}>
              <ChannelAvatar
                size={isMobile ? 40 : 24}
                channel={{ id: channel_id, name: channel_name, avatar: channel_avatar }}
                className='!rounded-full'
              />
            </Link>
          </div>
          <div className='flex flex-col gap-y-1'>
            <p className={clsx('text-sm font-semibold', styles.title)}>{title}</p>
            <div className='flex flex-col'>
              <p className='text-xs'>{channel_name}</p>
              <p className='text-xs text-gray-400'>
                {numbers_views} просмотров • {formatDistance(public_date, new Date(), { addSuffix: true, locale: ru })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const VideoItem = memo(ThumbnailVideo);
VideoItem.displayName = 'VideoItem';

'use client';
import { ChannelAvatar } from '@/entities/channel/ui/channel_avatar';
import { getPreviewVideo } from '@/shared/lib/getVideoPreview';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { useMediaQuery } from 'usehooks-ts';
import { VideoTitle } from './title';

export interface VideoCardProps {
  video_id: number;
  title?: string;
  preview_image: string | null;
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

export function VideoCard({
  video_id,
  title = '',
  channel_id,
  channel_name,
  channel_avatar,
  numbers_views,
  duration_sec,
  free,
  date_publication,
}: VideoCardProps) {
  const public_date = new Date(date_publication);
  const router = useRouter();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [previewSrc, setPreviewSrc] = useState<string>(() => getPreviewVideo(video_id));
  return (
    <div className='flex justify-center w-full h-full py-2 sm:py-0'>
      <div
        onClick={() => router.push(`/video/${video_id}`)}
        className='group flex h-full w-full cursor-pointer flex-col gap-y-2 rounded-[22px] px-0 transition-all duration-300 sm:p-2 sm:hover:-translate-y-1 sm:hover:bg-slate-50 sm:hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]'>
        <div className='relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-50 object-cover shadow-[0_12px_28px_rgba(15,23,42,0.12)]'>
          <Image
            onError={() => setPreviewSrc('/images/preview_video_stub.jpg')}
            className='aspect-video w-full bg-slate-50 object-contain transition-transform duration-300 group-hover:scale-[1.03]'
            width={1600}
            height={900}
            src={previewSrc}
            alt='Thumbnail'
          />
          <span className='absolute bottom-2 right-2 rounded-xl bg-black px-1 text-xs text-white transition-transform duration-300 group-hover:-translate-y-0.5'>
            {`${Math.floor(duration_sec / 60)}:${String(duration_sec % 60).padStart(2, '0')}`}
          </span>
          {!free && (
            <p className='absolute left-2 top-2 flex items-center gap-x-1 rounded-md bg-black px-1 text-xs text-white shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5'>
              <MdOutlineAttachMoney />
              Платное
            </p>
          )}
        </div>

        <div className='flex flex-row gap-x-2'>
          <div className='flex-shrink-0'>
            {/* TODO: добавить ссылку на канал, после создания страницы каналов */}
            <Link href={`/#${channel_id}`}>
              <ChannelAvatar
                size={isMobile ? 40 : 24}
                channel={{ id: channel_id, name: channel_name, avatar: channel_avatar }}
                className='!rounded-full'
              />
            </Link>
          </div>
          <div className='flex flex-col gap-y-1'>
            <VideoTitle title={title} />
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

export const VideoCardMemo = memo(VideoCard);
VideoCardMemo.displayName = 'VideoCardMemo';

import { BottomTabs } from '@/widgets/bottom-tabs/ui/bottom-tabs';
import { RightTabs } from '@/widgets/right-tabs/ui/right-tabs';
import { fetchVideoDetails } from '@/entities/video/api/server';
import { videoListStore } from '@/entities/video/model/video-list-store';
import { PlayerWrapper } from '@/features/player/ui/player-wrapper';
import { VideoProvider } from '@/features/player/ui/provider';
import { getPreviewVideo } from '@/shared/lib/getVideoPreview';
import { Header } from '@/widgets/header';
import { Playlist } from '@/widgets/playlist';
import { Info } from '@/widgets/video-info';
import { Metadata } from 'next';

type Props = {
  params: { id: string; slug?: string[] };
  searchParams: { [key: string]: string | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const { data: video } = await fetchVideoDetails(Number(id));
  const previewImage = video?.preview_image || getPreviewVideo(Number(id));
  const description = video?.description || 'Видео на Интересно и точка';

  if (!video) {
    return {
      title: 'Видео не найдено',
      description: 'Запрошенное видео не найдено или недоступно',
    };
  }

  return {
    title: video.title,
    description,
    openGraph: {
      title: video.title,
      description,
      type: 'video.other',
      url: `/video/${id}`,
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description,
      images: [previewImage],
    },
  };
}

export default async function page({ params, searchParams }: Props) {
  const id = params.id;
  const isFull = params.slug?.[0] === 'full';
  const { time = '0', autoplay = false } = searchParams;

  //const vidUrl = `https://interesnoitochka.ru/api/v1/videos/video/${id}/hls/playlist.m3u8`;
  const poster = getPreviewVideo(Number(id));

  const { data: video, error } = await fetchVideoDetails(Number(id));

  if (video) {
    videoListStore.addVideo?.(video);
  }

  if (error) {
    throw new Error(error.message);
  }

  if (!video) {
    throw new Error(`Video ${id} not found`);
  }

  if (isFull) {
    return (
      <div className='h-dvh bg-black place-content-center'>
        <VideoProvider videoId={Number(id)} fullscreen />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className='bg-white sm:bg-transparent p-0 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <PlayerWrapper poster={poster}>
            <VideoProvider videoId={Number(id)} time={Number(time)} {...(autoplay && { autoPlay: true })} />
          </PlayerWrapper>
          <Info video={video} />
          <BottomTabs videoId={Number(id)} />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          {video.playlist_id ? (
            <Playlist playlistId={video.playlist_id} currentVideoId={Number(id)} />
          ) : (
            <RightTabs videoId={Number(id)} />
          )}
        </div>
      </div>
    </>
  );
}

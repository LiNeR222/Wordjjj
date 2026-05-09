import { fetchPlaylistInfo, fetchPlaylistVideos } from '@/entities/video/api/server';
import { PlaylistItem } from '@/entities/video/types';
import { resolveImageURL } from '@/shared/lib';
import Link from 'next/link';
import Image from 'next/image';

interface PlaylistProps {
  playlistId: number;
  currentVideoId: number;
}

export const Playlist = async ({ playlistId, currentVideoId }: PlaylistProps) => {
  const [{ data: playlistInfo }, { data: playlistData }] = await Promise.all([
    fetchPlaylistInfo(playlistId),
    fetchPlaylistVideos(playlistId)
  ]);

  if (!playlistData || playlistData.items.length === 0) {
    return null;
  }

  return (
    <div className="h-full overflow-hidden rounded-xl border border-black/5 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="border-b border-black/5 p-5">
        <h2 className="text-lg font-bold text-gray-900">{playlistInfo?.title || 'Плейлист'}</h2>
        <p className="text-sm text-gray-500">{playlistInfo?.videos_count} видео</p>
      </div>
      <ul className="overflow-y-auto px-4 py-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {playlistData.items.map((item: PlaylistItem, index) => (
          <li key={item.video.video_id} className='group relative isolate py-2'>
            <div
              className={index !== 0 ? 'border-t border-transparent pt-2' : ''}
              style={
                index !== 0
                  ? {
                      borderImage: 'linear-gradient(90deg, rgba(226, 232, 240, 0), rgba(226, 232, 240, 0.8), rgba(226, 232, 240, 0)) 1',
                    }
                  : undefined
              }>
              <Link
                href={`/video/${item.video.video_id}`}
                className={`relative block rounded-xl px-2 py-3 transition-all duration-300 ${
                  item.video.video_id === currentVideoId
                    ? 'z-20 bg-blue-50/90 shadow-[inset_0_0_0_1px_rgba(147,197,253,0.8),0_10px_24px_rgba(59,130,246,0.10)]'
                    : 'z-10 border border-transparent hover:z-20 hover:-translate-y-0.5 hover:border-black/5 hover:bg-slate-50/95 hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]'
                }`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex w-6 shrink-0 justify-center text-sm font-semibold transition-colors duration-200 ${
                      item.video.video_id === currentVideoId ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="relative flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={resolveImageURL(item.video.preview_image, item.video.video_id)}
                      alt={item.video.title}
                      className="h-16 w-32 rounded-lg object-cover"
                      width={128}
                      height={64}
                    />
                    <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-xs text-white shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                      {new Date(item.video.duration_sec * 1000).toISOString().substr(14, 5)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-semibold leading-tight text-gray-800 transition-colors duration-200 group-hover:text-gray-950"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                      {item.video.title}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

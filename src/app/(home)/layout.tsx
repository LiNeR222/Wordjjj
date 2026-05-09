import { headerHeight } from '@/shared/config';
import { Header } from '@/widgets/header';

export default function HomeLayout({
  children,
  videos,
  shorts,
  videosInfiniteList,
}: Readonly<{
  children: React.ReactNode;
  audio: React.ReactNode;
  videos: React.ReactNode;
  videosInfiniteList: React.ReactNode;
  shorts: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div
        className={`min-h-[calc(100vh-${headerHeight}+1px)] flex-1 h-full bg-white p-2 !pt-0 sm:p-6 flex flex-col gap-4 overflow-x-hidden`}>
        {children}
        {videos}
        {shorts}
        {videosInfiniteList}
      </div>
    </>
  );
}

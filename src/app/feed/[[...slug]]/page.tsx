import { SwiperList } from '@/features/short-videos/ui/swiper-list';
import { isMobileUserAgent } from '@/shared/lib/is-mobile-user-agent';
import { CustomModal } from '@/shared/ui/custom-modal';
import { Header } from '@/widgets/header';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default function FeedPage({ params }: { params: { slug?: string[] } }) {
  const id = params.slug?.[0];

  const userAgent = headers().get('user-agent') || '';

  if (isMobileUserAgent(userAgent)) {
    redirect(`/feed-mobile/${id || ''}`);
  }

  //используется CustomModal, т.е. AntD Modal конфликтует с Virtuoso при определении высоты scroll контента
  return (
    <>
      <Header />
      <CustomModal>
        <SwiperList currentVideoId={Number(id)} />
      </CustomModal>
    </>
  );
}

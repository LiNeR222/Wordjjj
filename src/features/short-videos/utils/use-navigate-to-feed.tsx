import { useIsMobile } from '@/shared/lib/use-is-mobile';
import { useRouter } from 'next/navigation';

export const useNavigateToFeed = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const navigateToFeed = (id: number) => {
    if (isMobile) {
      router.push(`/feed-mobile/${id}`);
    } else {
      router.push(`/feed/${id}`);
    }
  };

  return { navigateToFeed };
};

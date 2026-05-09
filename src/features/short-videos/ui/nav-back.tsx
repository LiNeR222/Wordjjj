import { useIsMobile } from '@/shared/lib/use-is-mobile';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';
import { Button } from './button';

export const NavBack = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
//ToDo сохранять prev state, а при свайпе менять id

  const handleBack = () => {
    if (window.history.length <= 1) {
      router.push('/');
    } else {
      router.back();
    }
  };

  if (!isMobile) {
    return null;
  }

  return (
    <Button onClick={handleBack}>
      <FaArrowLeft />
    </Button>
  );
};

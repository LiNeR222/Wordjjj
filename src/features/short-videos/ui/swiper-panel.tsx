import { useDidUpdate } from '@/shared/lib/use-update-effect';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { AiOutlineDislike, AiOutlineDown, AiOutlineLike, AiOutlineUp, AiOutlineComment, AiOutlineShareAlt } from 'react-icons/ai';
import { useVote } from '../utils/use-vote';
import { Button } from './button';
import { NavBack } from './nav-back';

interface SwiperPanelProps {
  scrollTo: {
    prev: () => void;
    next: () => void;
  };
  videoId?: number;
}

export const SwiperPanel: FC<SwiperPanelProps> = ({ scrollTo, videoId }) => {
  const { vote, videoId: currentVideoId } = useVote();
  const [status, setStatus] = useState<'like' | 'dislike' | 'null'>('null');
  const [commentsOpen, setCommentsOpen] = useState(false);

  useDidUpdate(() => {
    setStatus('null');
  }, [currentVideoId]);

  return (
    <>
      <div className='absolute top-1 left-2 flex justify-center items-center z-30 w-12 h-12 text-2xl'>
        <NavBack />
      </div>
      <div className={clsx(
        'absolute flex flex-col z-30 gap-4 top-1/2 -translate-y-1/2',
        'sm:translate-x-1/2 sm:-right-3 sm:text-xl',
        'translate-x-auto right-1 text-2xl'
      )}>
        <Button onClick={scrollTo.prev}>
          <AiOutlineUp />
        </Button>
        <Button onClick={scrollTo.next}>
          <AiOutlineDown />
        </Button>
        <Button
          onClick={() => {
            const newStatus = status === 'like' ? 'null' : 'like';
            setStatus(newStatus);
            vote(newStatus);
          }}
          className={clsx({ '!bg-black !text-white': status === 'like' })}>
          <AiOutlineLike />
        </Button>
        <Button
          onClick={() => {
            const newStatus = status === 'dislike' ? 'null' : 'dislike';
            setStatus(newStatus);
            vote(newStatus);
          }}
          className={clsx({ '!bg-black !text-white': status === 'dislike' })}>
          <AiOutlineDislike />
        </Button>
        <Button onClick={() => setCommentsOpen(true)}>
          <AiOutlineComment />
        </Button>
        <Button onClick={() => {
          if (videoId) {
            navigator.clipboard.writeText(`${window.location.origin}/feed/${videoId}`);
          }
        }}>
          <AiOutlineShareAlt />
        </Button>
      </div>
    </>
  );
};
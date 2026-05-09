/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { commentsListStore } from '@/entities/comment/model/comments-list-store';
import { CommentCard } from '@/entities/comment/ui/comment-card';
import { Spin } from '@/shared/ui/spin';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

interface CommentsListProps {
  videoId: number;
}

export const CommentsList = observer(({ videoId }: CommentsListProps) => {
  const { loading, comments, fetchMoreComments } = commentsListStore;
  const collection = comments[videoId];
  const lastCommentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!comments[videoId]) {
      fetchMoreComments(videoId);
    }
  }, [fetchMoreComments, videoId, comments]);

  useEffect(() => {
    if (!lastCommentRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchMoreComments(videoId);
        }
      },
      { threshold: 0.5 }
    );

    if (lastCommentRef.current) {
      observer.observe(lastCommentRef.current);
    }

    return () => {
      if (lastCommentRef.current) {
        observer.unobserve(lastCommentRef.current);
      }
    };
  }, [fetchMoreComments, videoId, collection, collection?.list.length]);

  return (
    <div className='flex flex-col gap-6'>
      <p className='text-lg font-semibold m-0 tracking-[-0.4px]'>
        Комментарии <span className='text-[var(--color-grey)] ml-1'>{collection?.count_comments}</span>
      </p>
      <div className='flex flex-col gap-6'>
        {collection &&
          collection.list.map((comment, index) => (
            <div key={comment.instance.id} ref={index === collection.list.length - 1 ? lastCommentRef : null}>
              <CommentCard comment={comment} />
            </div>
          ))}
      </div>
      {loading && (
        <div className='flex justify-center items-center h-10'>
          <Spin />
        </div>
      )}
    </div>
  );
});

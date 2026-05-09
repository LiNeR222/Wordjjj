'use client';
import { Tabs } from '@/components/ui/tabs';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { FC, Suspense, useRef, useState } from 'react';
import { bottomTabs } from '../config';
import { TTabs } from '../types';
import { SkeletonComments } from './comments-skeleton';
import { SkeletonUsers } from './users-skeleton';

const VideoComments = dynamic(() => import('@/features/video-comments'), {
  ssr: false,
});
const VideoUsers = dynamic(() => import('@/features/video-users/users'), {
  ssr: false,
});

export const BottomTabs: FC<{ videoId: number }> = ({ videoId }) => {
  const [currentTab, setCurrentTab] = useState<TTabs>('comments');
  const fallbackHeight = useRef(0);
  const contentTabsRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className='col-[1/7] lg:col-[1/5]'>
      <div className='pl-2 sm:pl-0'>
        <Tabs
          options={bottomTabs}
          onChange={({ value }) => {
            fallbackHeight.current = contentTabsRef.current?.offsetHeight || 0;
            setCurrentTab((value as TTabs) || 'comments');
          }}
          value={bottomTabs.find(tab => tab.value === currentTab)}
        />
      </div>
      <div
        ref={contentTabsRef}
        className={clsx(
          'flex min-h-auto lg:min-h-[268px] w-full overflow-x-auto p-6 bg-white rounded-lg',
          currentTab === 'comments' && 'rounded-tl-none'
        )}>
        <Suspense
          fallback={
            <div style={{ height: fallbackHeight.current, width: '100%' }}>
              {currentTab === 'comments' ? <SkeletonComments /> : <SkeletonUsers />}
            </div>
          }>
          {currentTab === 'comments' ? <VideoComments videoId={videoId} /> : <VideoUsers />}
        </Suspense>
      </div>
    </div>
  );
};

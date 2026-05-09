'use client';
import { Tabs } from '@/components/ui/tabs';
import { formatVideoStore } from '@/features/player/model/format-video-player-store';
import { observer } from 'mobx-react-lite';
import { FC, useState } from 'react';
import { rightTabs } from '../config';
import { getTabElement } from '../lib';
import { TTabs } from '../types';

export const RightTabs: FC<{ videoId?: number }> = observer(({ videoId }) => {
  const [currentTab, setCurrentTab] = useState<TTabs>('videos');
  const isWideformatPlayer = formatVideoStore.wideFormat;

  const tabElement = getTabElement(currentTab, videoId);

  return (
    <div
      className={`${isWideformatPlayer ? 'row-[4/5] lg:row-[2/4] col-[1/7] lg:col-[5/7]' : 'col-[1/7] lg:col-[5/7] lg:row-[1/3]'}`}>
      <Tabs
        onChange={({ value }) => setCurrentTab((value as TTabs) || 'videos')}
        value={rightTabs.find(tab => tab.value === currentTab)}
        options={rightTabs}
      />
      {tabElement}
    </div>
  );
});

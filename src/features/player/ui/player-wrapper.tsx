'use client';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren } from 'react';
import { formatVideoStore } from '../model/format-video-player-store';

export const PlayerWrapper: FC<PropsWithChildren & { poster: string; className?: string }> = observer(({ children, poster, className }) => {
  const isWideFormatPlayer = formatVideoStore.wideFormat;
  return (
    <div
      style={{ backgroundImage: `url(${poster})` }}
      className={clsx(
        'w-full aspect-video overflow-hidden rounded-xl border border-black/5 bg-cover bg-center shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
        {
          'col-[1/7] max-w-[1900px] justify-self-center': isWideFormatPlayer,
          'col-[1/7] lg:col-[1/5] ': !isWideFormatPlayer,
        },
        className
      )}>
      {children}
    </div>
  );
});

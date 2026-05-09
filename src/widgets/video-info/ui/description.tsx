'use client';
import { Button } from '@/shared/ui';
import { FC, useState } from 'react';

interface VideoDescriptionProps {
  description: string;
}

const DESCRIPTION_THRESHOLD = 100; // порог в символах для показа кнопки "Развернуть..."

export const VideoDescription: FC<VideoDescriptionProps> = ({ description }) => {
  const [expanded, setExpanded] = useState(false);

  // Определяем, нужно ли показывать кнопку развернуть
  const showExpandButton = description && description.length > DESCRIPTION_THRESHOLD;

  // При неразвёрнутом состоянии показываем усечённое описание
  const displayedDescription =
    expanded || !showExpandButton ? description : `${description.slice(0, DESCRIPTION_THRESHOLD)}...`;

  return (
    <div className='pt-3 leading-[1.4]'>
      <p className='m-0'>{displayedDescription}</p>
      {description.length > DESCRIPTION_THRESHOLD && (
        <Button className='mt-2' size='small' onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Свернуть' : 'Развернуть'}
        </Button>
      )}
    </div>
  );
};

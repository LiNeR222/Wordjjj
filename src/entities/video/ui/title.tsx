import clsx from 'clsx';
import { FC } from 'react';
import styles from './styles.module.css';

interface VideoTitleProps {
  title: string;
  columns?: number;
  className?: string;
}

export const VideoTitle: FC<VideoTitleProps> = ({ title, className }) => {
  return (
    <p className={clsx('text-sm font-semibold', styles.title, className)} >
      {title}
    </p>
  );
};

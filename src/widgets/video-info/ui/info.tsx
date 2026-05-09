import { VideoDetailed } from '@/entities/video/types';
import { Badge } from '@/shared/ui';
import { FC } from 'react';
import { badgeColors } from '../config';
import { VideoInfoActions } from './action';
import { VideoDescription } from './description';
import styles from './info.module.css';
import { Subscription } from './subscription';

interface InfoProps {
  video: VideoDetailed;
}
// Функция для вычисления относительного времени публикации
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Сегодня';
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ${diffMonths === 1 ? 'месяц' : diffMonths < 5 ? 'месяца' : 'месяцев'} назад`;
}
export const Info: FC<InfoProps> = ({ video }) => {
  return (
    <div className='col-[1/7] lg:col-[1/5] row-[2/3] '>
      <div className={styles.wrapper}>
        <div>
          <h1 className={styles.title}>{video.title}</h1>
          <p className={styles.views}>
            {video.numbers_views} просмотров · {getRelativeTime(video.date_publication)}
          </p>
        </div>
        <div className={styles.actions}>
          <VideoInfoActions video={video} />
        </div>
        <div className={styles.author}>
          <Subscription channelId={video.channel_id} />
        </div>
        <VideoDescription description={video.description} />
        <div className={styles.tags}>
          {video.tags?.map((tag: string) => <span key={tag} className='whitespace-nowrap'>{`#${tag}`}</span>)}
        </div>
        {(video?.categories?.length as number) > 0 && (
          <div className={styles.categories}>
            <p className={styles.categories__title}>Категории</p>
            <div className={styles.categories__list}>
              {video?.categories?.map((category: string, index: number) => (
                <Badge key={category} color={badgeColors[index % badgeColors.length]}>
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

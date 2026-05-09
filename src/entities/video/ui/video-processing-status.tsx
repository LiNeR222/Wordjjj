import { FC, useEffect, useState } from 'react';
import { videoApi } from '../api';
import { VideoProgressUpdate, VideoProcessingStatus, VideoSubscription } from '../types';
import { centrifugoService } from '@/shared/services/centrifugo';
import { Progress, Spin, Tooltip } from 'antd';

interface VideoProcessingStatusProps {
  videoId: number;
}

/**
 * Компонент для отображения статуса обработки видео
 */
export const VideoProcessingStatusComponent: FC<VideoProcessingStatusProps> = ({ videoId }) => {
  const [status, setStatus] = useState<VideoProcessingStatus | null>(null);
  const [subscription, setSubscription] = useState<VideoSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<VideoProgressUpdate | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const status = await videoApi.getVideoProcessingStatus(videoId);
        setStatus(status);

        if (status.is_processing) {
          const subscriptionData = await videoApi.subscribeToVideoUpdates(videoId);
          setSubscription(subscriptionData);
        } else {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Ошибка при получении статуса обработки видео:', error);
        setError('Не удалось получить статус обработки видео');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    return () => {
      if (subscription) {
        centrifugoService.unsubscribe(subscription.channel);
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (!subscription) return;

    try {
      centrifugoService.init(subscription.token);

      centrifugoService.subscribe<VideoProgressUpdate>(subscription.channel, (data) => {
        setLastUpdate(data);

        if (data.processing_status === 'completed' || data.progress === 100) {
          setIsCompleted(true);
          setStatus(prev => prev ? {
            ...prev,
            progress: 100,
            is_processing: false
          } : null);

          console.log('Обработка видео завершена, отписываемся от канала:', subscription.channel);
          centrifugoService.unsubscribe(subscription.channel);
        }
      });
    } catch (error) {
      console.error('Ошибка при подписке на обновления:', error);
      setError('Не удалось подписаться на обновления статуса обработки');
    }

    return () => {
      centrifugoService.unsubscribe(subscription.channel);
    };
  }, [subscription]);

  if (loading) {
    return <div className="flex justify-center items-center h-6"><Spin size="small" /></div>;
  }

  if (error) {
    return <Tooltip title={error}><span className="text-red-500">Ошибка</span></Tooltip>;
  }

  const isFailed = status?.processing_status === 'failed'
    || lastUpdate?.processing_status === 'failed'
    || lastUpdate?.processing_status === 'error';

  if (isFailed) {
    const failMessage = status?.processing_status === 'failed'
      ? 'Обработка не завершена. Попробуйте загрузить видео повторно'
      : 'Произошла ошибка при обработке';
    return (
      <Tooltip title={failMessage}>
        <span className="text-red-500">Ошибка</span>
      </Tooltip>
    );
  }

  if (isCompleted || (status && !status.is_processing)) {
    return <span className="text-green-500">Готово</span>;
  }

  const progress = lastUpdate?.progress || (status?.progress || 0);
  const statusText = lastUpdate?.processing_status || 'processing';
  const message = lastUpdate?.processing_message || '';

  const getStatusColor = () => {
    switch (statusText) {
      case 'error':
      case 'failed':
        return '#f5222d';
      case 'completed':
        return '#52c41a';
      default:
        return '#1890ff';
    }
  };

  const getStatusText = () => {
    switch (statusText) {
      case 'initializing':
        return 'Инициализация';
      case 'downloading':
        return 'Загрузка';
      case 'processing':
        return 'Обработка';
      case 'transcoding':
        return 'Транскодирование';
      case 'generating_subtitles':
        return 'Создание субтитров';
      case 'finalizing':
        return 'Финализация';
      case 'completed':
        return 'Завершено';
      case 'error':
      case 'failed':
        return 'Ошибка';
      default:
        return 'Обработка';
    }
  };

  return (
    <Tooltip title={message || getStatusText()}>
      <div className="flex flex-col">
        <span className="text-xs mb-1">{getStatusText()} ({progress}%)</span>
        <Progress
          percent={progress}
          size="small"
          status={statusText === 'error' || statusText === 'failed' ? 'exception' : undefined}
          strokeColor={getStatusColor()}
          showInfo={false}
        />
      </div>
    </Tooltip>
  );
};

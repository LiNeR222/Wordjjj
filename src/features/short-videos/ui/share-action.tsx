'use client';
import { message } from 'antd';
import { FC } from 'react';

interface ShareActionProps {
  videoId: number;
}

export const ShareAction: FC<ShareActionProps> = ({ videoId }) => {
  const handleShare = async () => {
    const url = `${window.location.origin}/feed/${videoId}`;
    try {
      await navigator.clipboard.writeText(url);
      message.success('Ссылка скопирована');
    } catch {
      message.error('Не удалось скопировать');
    }
  };
  return null;
};
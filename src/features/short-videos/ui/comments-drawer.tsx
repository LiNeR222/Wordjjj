'use client';
import { FC, useEffect, useRef } from 'react';
import { Drawer } from 'antd';
import { CommentsList } from '@/features/video-comments/ui/comments-list';
import { AddComment } from '@/entities/comment/ui/add-comment';

interface CommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  videoId: number;
}

export const CommentsDrawer: FC<CommentsDrawerProps> = ({ open, onClose, videoId }) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.scrollTop = 0;
    }
  }, [open]);

  return (
    <Drawer
      title="Комментарии"
      placement="bottom"
      onClose={onClose}
      open={open}
      height="70%"
      className="rounded-t-2xl"
      styles={{ body: { padding: '16px' } }}
    >
      <div ref={drawerRef} className="overflow-y-auto max-h-full">
        <AddComment videoId={videoId} />
        <CommentsList videoId={videoId} />
      </div>
    </Drawer>
  );
};
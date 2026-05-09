import { FC } from 'react';

interface ReplyButtonProps {
  onReply: () => void;
}

export const ReplyButton: FC<ReplyButtonProps> = ({ onReply }) => (
  <button
    className='outline-none border-0 p-0 m-0 bg-transparent font-semibold text-sm tracking-[-0.4px]'
    onClick={onReply}>
    Ответить
  </button>
);

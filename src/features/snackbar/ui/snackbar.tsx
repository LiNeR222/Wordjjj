'use client';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { typeStyles } from '../config';
import { SnackbarProps } from '../types';

export const Snackbar: React.FC<SnackbarProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      className={clsx(
        'max-w-md ml-4 mt-2 pointer-events-auto  transition-all duration-300 ease-in-out transform',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
      <div
        className={`p-2 rounded-lg shadow-lg relative flex items-center justify-between bg-white border-2 border-l-4 ${typeStyles[type]}`}>
        <span className='break-words w-full pr-2 text-[0.75rem]'>{message}</span>
        <div className='relative w-0 h-full flex flex-col items-center'>
          <button
            className='text-inherit hover:text-gray-500 focus:outline-none mr-3'
            onClick={handleClose}
            aria-label='Закрыть'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

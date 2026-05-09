import clsx from 'clsx';
import { FC } from 'react';
import { Icon } from '../icon';

interface NavButtonProps {
  type: 'prev' | 'next' | 'number';
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  children?: React.ReactNode;
}

export const NavButton: FC<NavButtonProps> = ({ type, onClick, disabled = false, isActive, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex items-center justify-center w-[42px] h-[30px] -mr-px',
        'text-sm font-medium',
        'hover:text-gray-500 hover:bg-gray-100',
        'border border-gray-200',
        type === 'prev' && 'rounded-s-lg',
        type === 'next' && 'rounded-e-lg',
        disabled && 'cursor-not-allowed backdrop-opacity-50',
        isActive ? 'text-white bg-gray-700 hover:bg-gray-500' : 'text-gray-700 bg-[#FAFBFD]'
      )}>
      {type === 'number' ? (
        <span className={clsx(disabled && 'opacity-50')}>{children}</span>
      ) : (
        <Icon
          type='bracket-left'
          className={clsx('w-6 h-6', type === 'next' && 'rotate-180', disabled && 'opacity-50')}
        />
      )}
    </button>
  );
};

/*
'px-4 py-2
 text-sm font-medium 
 text-gray-900 bg-white 
 border border-gray-200
 hover:bg-gray-100 hover:text-gray-700
 focus:z-10 focus:ring-2 focus:ring-gray-700 focus:text-gray-700',

*/

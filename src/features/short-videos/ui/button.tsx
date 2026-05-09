import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Button = ({ children, onClick, className }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center justify-center rounded-full  w-12 h-12  cursor-pointer border-none hover:opacity-80',
        'bg-transparent text-white',
        'sm:bg-white sm:text-black',
        className
      )}>
      {children}
    </button>
  );
};

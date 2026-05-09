import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface NavigationPanelProps {
  containerRef: React.RefObject<HTMLDivElement>;
  scrollToNext: () => void;
  scrollToPrev: () => void;
  currentIndex: number;
  totalItems: number;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  containerRef,
  scrollToNext,
  scrollToPrev,
  currentIndex,
  totalItems,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef]);

  return (
    <div
      className={clsx(
        'flex items-center justify-between w-full',
        'absolute top-[235px] transform -translate-y-1/2 z-10 transition-opacity duration-300',
        isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}>
      <button
        className='absolute top-1/2 left-2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
        onClick={scrollToPrev}
        disabled={currentIndex === 0}>
        <IoIosArrowBack size={24} className='hover:scale-110 transition-transform' />
        <span className='sr-only'>Previous</span>
      </button>

      <button
        className='absolute top-1/2 right-2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
        onClick={scrollToNext}
        disabled={currentIndex === totalItems - 1}>
        <IoIosArrowForward size={24} className='hover:scale-110 transition-transform' />
        <span className='sr-only'>Next</span>
      </button>
    </div>
  );
};

export default NavigationPanel;

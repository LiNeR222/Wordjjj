import { useEffect } from 'react';

type UseHandleKeyboardNavigationProps = {
  scrollTo: {
    next: () => void;
    prev: () => void;
  };
};

export const useHandleKeyboardNavigation = ({ scrollTo }: UseHandleKeyboardNavigationProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      switch (key) {
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          scrollTo.next();
          break;

        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          scrollTo.prev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollTo]);
};

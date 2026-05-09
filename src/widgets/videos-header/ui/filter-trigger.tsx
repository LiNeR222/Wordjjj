import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { videoHeaderStore } from '../model/video-header-store';

interface FilterTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterTrigger: FC<FilterTriggerProps> = observer(({ children, className }) => {
  const { toggleIsFilterActive } = videoHeaderStore;

  return (
    <button onClick={() => toggleIsFilterActive()} className={className}>
      {children}
    </button>
  );
});

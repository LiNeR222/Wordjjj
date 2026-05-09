'use client';

import { useHydrationState } from '@/shared/lib/use-hydration-state';
import clsx from 'clsx';
import React from 'react';
import { NavButton } from './nav-button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  showPageButtons?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  showPageButtons = true,
  onPageChange,
  className,
}) => {
  const isHydrated = useHydrationState();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={clsx('inline-flex', className)} role='group'>
      <NavButton
        type='prev'
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={isHydrated ? currentPage === 1 : false}
      />

      {showPageButtons &&
        Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <NavButton key={page} type='number' onClick={() => handlePageClick(page)} isActive={page === currentPage}>
            {page}
          </NavButton>
        ))}

      <NavButton
        type='next'
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={isHydrated ? currentPage === totalPages : false}
      />
    </div>
  );
};

export default Pagination;

'use client';

import { Modal } from '@/shared/ui/modal';
import { observer } from 'mobx-react-lite';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { videoHeaderStore } from '../model/video-header-store';
import { FilterAuth } from './filter-auth';
import { FilterCategory } from './filter-category';
import { FilterPayment } from './filter-payment';
import { FilterPeriod } from './filter-period';
import { Sort } from './sort';
import styles from './style.module.css';
export const FilterControl = observer(() => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { filters, setUpFilters, toggleIsFilterActive, isFilterActive } = videoHeaderStore;
  //const isHydrated = useHydrationState();

  useEffect(() => {
    setUpFilters(searchParams);
  }, [searchParams, setUpFilters]);

  const handleOk = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    toggleIsFilterActive(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCancel = () => {
    setUpFilters(searchParams);
    toggleIsFilterActive(false);
  };

  /*  const isVisible = useMemo(
    () => (isHydrated && isSearchActive) || hasFilters,
    [isHydrated, isSearchActive, hasFilters]
  );
*/

  return (
    <>
      <Modal
        open={isFilterActive}
        onOk={handleOk}
        onCancel={handleCancel}
        onClose={handleCancel}
        cancelText='Отмена'
        okText='Применить'
        className={styles.filterModal}>
        <div className='pt-6 space-y-3'>
          <FilterCategory />
          <div className='flex flex-col gap-3 px-0 sm:px-4'>
            <Sort className='pt-3' />
            <FilterPayment />
            <FilterAuth />
            <FilterPeriod />
          </div>
        </div>
      </Modal>
    </>
  );
});

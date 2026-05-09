'use client';

import { myStatisticsStore } from '@/entities/video/model/my-statistics-store';
import { formatBytes, markDigitPlace } from '@/shared/lib/helpers';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { StatsCard } from './card';
import { NumberPair } from './number-pair';

export const StatsBoard = observer(() => {
  const { statistics, fetchMyStatistics } = myStatisticsStore;

  const {
    views = 0,
    views_per = 0,
    period = 'all_time',
    registrations_referrals = 0,
    registrations_utm = 0,
    registrations_per = 0,
    disk_usage = 0,
    cost = 0,
    disk_usage_per = 0,
  } = statistics ?? {};

  useEffect(() => {
    if (!statistics) {
      fetchMyStatistics();
    }
  }, [fetchMyStatistics, statistics]);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <StatsCard
        title='Всего просмотров'
        value={markDigitPlace(views)}
        percentage={views_per}
        icon='view'
        period={period}
      />
      <StatsCard
        title='Регистраций'
        value={<NumberPair>{[markDigitPlace(registrations_referrals), markDigitPlace(registrations_utm)]}</NumberPair>}
        percentage={registrations_per}
        icon='people'
        period='week'
      />
      <StatsCard
        title='Биллинг'
        value={<NumberPair>{[formatBytes(disk_usage), `${cost} мес.`]}</NumberPair>}
        percentage={disk_usage_per}
        icon='storage'
        period='week'
      />
    </div>
  );
});
'use client';

import { channelsListStore } from '@/entities/channel/model/channels-list-store';
import { SubscriptionInfo } from '@/entities/channel/ui/subscription-info';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';

interface SubscriptionProps {
  channelId: number;
}

export const Subscription: FC<SubscriptionProps> = observer(({ channelId }) => {
  const { channels, fetchChannelById } = channelsListStore;
  const channel = channels[channelId];


  useEffect(() => {
    if (!channel) {
      fetchChannelById(channelId);
    }
  }, [channel, channelId, fetchChannelById]);

  if (!channel || !channel.currentUserSubscription) {
    return null;
  }

  return <SubscriptionInfo subscriptionStore={channel.currentUserSubscription} />;
});

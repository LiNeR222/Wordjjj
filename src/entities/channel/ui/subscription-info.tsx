import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { SubscriptionStore } from '../model/subscription-store';
import { SubscribeActions } from './subscribe-actions';
import { ChannelAvatar } from './channel_avatar';
interface SubscriptionInfoProps {
  subscriptionStore: SubscriptionStore;
}

export const SubscriptionInfo: FC<SubscriptionInfoProps> = observer(({ subscriptionStore }) => {
  const { channelId, subscription } = subscriptionStore;

  useEffect(() => {
    if (!subscription) {
      subscriptionStore.fetchSubscription();
    }
  }, [subscription, subscriptionStore]);

  if (!subscription) {
    return null;
  }

  const { channel_name, channel_avatar } = subscription;

  return (
    <div className='flex items-center justify-start'>
      <ChannelAvatar size={32} channel={{ id: channelId, name: channel_name, avatar: channel_avatar }} />
      <div className='font-semibold text-base leading-15 break-words pl-2 pr-4'>{channel_name}</div>
      <SubscribeActions subscriptionStore={subscriptionStore} />
    </div>
  );
});

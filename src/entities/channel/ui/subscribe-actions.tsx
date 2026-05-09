import { authStore } from '@/entities/auth/model/authStore';
import { Button } from '@/shared/ui/ant-button';
import { Dropdown } from '@/shared/ui/dropdown';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { subscriptionMenuItems } from '../config';
import { getIconByKey } from '../lib';
import { SubscriptionStore } from '../model/subscription-store';
import styles from './subscribe-actions.module.css';

interface SubscribeActionsProps {
  subscriptionStore: SubscriptionStore;
}

export const SubscribeActions = observer(({ subscriptionStore }: SubscribeActionsProps) => {
  const { isSubscribed, loading, isMuted } = subscriptionStore;
  const selectedKey = isMuted ? '2' : '1';
  const selectedIcon = getIconByKey(subscriptionMenuItems, selectedKey);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!isPressed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsPressed(false);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [isPressed]);

  const actionMap = new Map([
    ['1', () => subscriptionStore.unMuteSubscription()],
    ['2', () => subscriptionStore.muteSubscription()],
    ['3', () => subscriptionStore.unsubscribe()],
  ]);

  const handleMenuClick = (event: { key: string }) => {
    if (event.key === selectedKey) {
      return;
    }
    const action = actionMap.get(event.key);
    action?.();
  };

  const handleSubscribe = async () => {
    if (!authStore.isAuth) {
      const result = await authStore.signIn();
      if (!result) return;
    }

    setIsPressed(true);
    await subscriptionStore.subscribe();
  };

  if (isSubscribed && authStore.isAuth) {
    return (
      <div className='flex-none'>
        <Dropdown
          menu={{ items: subscriptionMenuItems, selectedKeys: [selectedKey], onClick: handleMenuClick }}
          placement='bottomRight'>
          <Button
            className={clsx('items-center rounded-xl', styles.subscribedButton, isPressed && styles.pressed)}
            style={{ gap: '5px' }}
            variant='outlined'
            size='small'
            disabled={loading}
            icon={selectedIcon}
            iconPosition='start'>
            <span className='font-semibold tracking-tight text-xs'>Вы подписаны</span>
            <IoIosArrowDown size={14} />
          </Button>
        </Dropdown>
      </div>
    );
  }

  return (
    <Button
      color='default'
      variant='solid'
      size='small'
      className={clsx('rounded-xl', styles.subscribeButton, isPressed && styles.pressed)}
      disabled={loading}
      loading={loading}
      onClick={handleSubscribe}>
      <span className='font-semibold tracking-tight text-xs'>Подписаться</span>
    </Button>
  );
});

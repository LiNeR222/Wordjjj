import type { MenuProps } from 'antd';
export type { MenuProps };

export interface Channel {
  id: number;
  name?: string;
  avatar?: string;
  ownerId?: number;
}

export interface Subscription {
  subscription: boolean;
  notifications: boolean;
  count_subscription: number;
  channel_name: string;
  channel_avatar: string;
  channel_owner_id: number;
}

export interface SubscribeOptions {
  notifications: boolean;
}

export type SubscriptionStatus = 'owner' | 'subscribed' | 'pending' | 'unsubscribed';

export interface SubscriptionStatusResponse {
  status: SubscriptionStatus;
}

export type MenuItemWithIcon = {
  label: React.ReactNode;
  key: string;
  icon?: React.ReactNode;
};

import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { BACKEND_ORIGIN, apiPath } from '@/shared/config';
import { Channel } from '../types';

interface ChannelAvatarProps {
  channel: Channel;
  size: number;
  className?: string;
}

export const ChannelAvatar = ({ channel, size, className }: ChannelAvatarProps) => {
  const src = /^(https?:\/\/)/.test(channel.avatar || '')
    ? channel.avatar
    : `${BACKEND_ORIGIN}${apiPath}/users/${channel.id}/avatar`;
  return <UserAvatar size={size} src={src} userName={channel.name} className={className}  />;
};

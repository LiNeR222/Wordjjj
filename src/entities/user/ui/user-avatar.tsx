'use client';
import clsx from 'clsx';
import Image from 'next/image';
import { FC, memo, useMemo } from 'react';
import { LuUser } from 'react-icons/lu';

interface UserAvatarProps {
  src?: string;
  userName?: string;
  size?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  lineHight?: number;
  className?: string;
}

const getInitials = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : '';
};

const isValidSrc = (src: string) => /^(https?:\/\/)/.test(src);

export const UserAvatar: FC<UserAvatarProps> = ({
  src,
  userName,
  size = 24,
  width,
  height,
  fontSize = 14,
  lineHight = 20,
  className,
}) => {
  const { w, h } = useMemo(() => {
    return { w: width || size, h: height || size };
  }, [size, width, height]);

  if (src && isValidSrc(src)) {
    return (
      <Image
        src={src}
        alt={userName || ''}
        width={w}
        height={h}
        className={clsx('cursor-pointer rounded-xl object-cover border-gray-300 bg-gray-200', className)}
        style={{ width: `${w}px`, height: `${h}px` }}
      />
    );
  }

  return (
    <div
      className={clsx(
        `flex items-center justify-center content-center rounded-xl overflow-hidden cursor-pointer`,
        'bg-custom-radial',
        className
      )}
      style={{ width: `${w}px`, height: `${h}px` }}>
      {userName ? (
        <span style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHight}px` }} className='font-medium text-white'>
          {getInitials(userName)}
        </span>
      ) : (
        <LuUser className='text-white' fontSize={24} />
      )}
    </div>
  );
};

export const UserAvatarMemo = memo(UserAvatar);

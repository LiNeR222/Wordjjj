import { FC, useState } from 'react';
import { Skeleton } from './skeleton';

import Image, { ImageProps } from 'next/image';

const urlPattern = /^(https?:\/\/|\/)/;

export const Preview: FC<ImageProps> = ({ src, ...rest }) => {
  const [imageError, setImageError] = useState(!urlPattern.test(String(src)));

  const handleImageError = () => {
    setImageError(true);
  };

  if (!imageError) return <Image src={src} {...rest} onError={handleImageError} />;

  return <Skeleton />;
};

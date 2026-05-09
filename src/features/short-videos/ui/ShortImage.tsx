import Image from 'next/image';
import { useState } from 'react';

const MyImage = ({
  primarySrc,
  fallbackSrc,
  alt,
  width,
  height,
  className = '',
}: {
  primarySrc: string; // Основная ссылка на изображение
  fallbackSrc: string; // Альтернативная ссылка на изображение
  alt: string;
  width: number;
  height: number;
  className: string;
}) => {
  const [src, setSrc] = useState(primarySrc); // Состояние для хранения текущей ссылки

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setSrc(fallbackSrc); // Меняем ссылку на альтернативную
  };

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      onError={handleImageError} // Обработчик ошибки
    />
  );
};

export default MyImage;

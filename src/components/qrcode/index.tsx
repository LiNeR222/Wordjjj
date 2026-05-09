'use client';

import { QRCode as AntQRCode } from 'antd';
/**
 * Компонент QRCode генерирует QR-код для переданной ссылки.
 *
 * @param {Object} props - Свойства компонента.
 * @param {string} props.value - Ссылка для генерации QR-кода.
 * @param {number} [props.size=200] - Размер изображения (ширина и высота в пикселях).
 * @returns {JSX.Element} Изображение с QR-кодом.
 *
 * @example
 * <QRCode value="https://t.me/your_bot" size={200}  />
 */
const QRCode = ({ value, size = 200 }: { value: string; size?: number }): JSX.Element => {
  return <AntQRCode value={value} size={size} className='p-0 rounded-none' />;
  // <img src={url} alt="QR Code" width={size} height={size} />;
};

export default QRCode;

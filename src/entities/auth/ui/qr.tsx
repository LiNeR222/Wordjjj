import { QRCode as AntQRCode } from 'antd';
import { FC } from 'react';

interface QRCodeProps { 
  value: string;
  size?: number;
}

const QRCode: FC<QRCodeProps> = ({ value, size = 200 }: QRCodeProps): JSX.Element => {
  return <AntQRCode value={value} size={size} className='p-0 rounded-none' />;
};

export default QRCode;

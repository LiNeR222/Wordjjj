import { getPreviewVideo } from '@/shared/lib/getVideoPreview';
import { Button } from '@/shared/ui/button/button';
import { Image, UploadFile } from 'antd';
import { FC, useEffect, useState } from 'react';

interface PreviewImageProps {
  videoId: number;
  onPreviewUnset: () => void;
  file: UploadFile | null;
}

export const PreviewImage: FC<PreviewImageProps> = ({ videoId, onPreviewUnset, file }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file?.originFileObj) {
      const url = URL.createObjectURL(file.originFileObj);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const src = fileUrl || getPreviewVideo(videoId);

  return (
    <>
      <div className='relative w-full h-[140px] flex justify-center items-center overflow-hidden rounded-md mb-2'>
        <div className='absolute inset-0 overflow-hidden z-10'>
          <Image src={src} alt='Blur preview' className='w-full h-full object-cover blur-md scale-105' />
        </div>
        <div className='relative z-10 h-full flex justify-center items-center'>
          <Image
            src={src}
            alt='Превью видео'
            width={240}
            height={140}
            className='max-h-full max-w-full rounded-md object-contain'
          />
        </div>
      </div>
      <Button onClick={onPreviewUnset} type='primary' size='middle' variant='solid' color='default' block>
        Изменить превью видео
      </Button>
    </>
  );
};

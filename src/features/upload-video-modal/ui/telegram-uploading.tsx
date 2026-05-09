import { videoListStore } from '@/entities/video/model/video-list-store';
import { useSearchAppParams } from '@/shared/hooks';
import { Button } from '@/shared/ui/button/button';
import { message } from '@/shared/ui/message';
import { useEffect, useState } from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ISubmitData } from '../types';

interface TelegramUploadingProps extends UseControllerProps<ISubmitData, 'videoId'> {
  videoIdSearchParam: number;
  isModalUpdate: boolean;
}

export const TelegramUploading = (props: TelegramUploadingProps) => {
  const {
    field: { onChange },
  } = useController(props);
  const { videoIdSearchParam, isModalUpdate } = props;
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { checkVideo } = videoListStore;
  const { editSearchParams } = useSearchAppParams();

  useEffect(() => {
    const check = async (id: number) => {
      const result = await checkVideo(id);
      if (result) {
        setIsSuccess(true);
        message.success('Видео с данным ID загружено');
        onChange(id);
      }
      if (!result) {
        setIsError(true);
        message.error('Не удалось найти видео по данному ID');
      }
    };
    check(videoIdSearchParam);
  }, [checkVideo, onChange, videoIdSearchParam]);

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex flex-col items-center content-center justify-center gap-y-1 bg-gray-100 p-4 rounded-xl h-[140px]'>
        {!isSuccess && !isError && <h3 className='text-xl font-semibold text-gray-800'>Проверка видео по ID...</h3>}
        {isSuccess && !isError && (
          <div className='flex items-center'>
            <FaCheckCircle className='text-green-500 mr-2' />
            <h3 className='text-xl font-semibold text-gray-800'>Видео загружено</h3>
          </div>
        )}
        {isError && (
          <div className='flex items-center'>
            <FaTimesCircle className='text-red-500 mr-2' />
            <h3 className='text-xl font-semibold text-gray-800'>Ошибка загрузки</h3>
          </div>
        )}
      </div>
      <Button
        onClick={() => {
          onChange(null);
          editSearchParams('remove', ['video_id']);
        }}
        type='primary'
        size='middle'
        variant='solid'
        color='default'
        block>
        {isModalUpdate ? 'Изменить видео (загрузить новое)' : 'Загрузить видео через сайт'}
      </Button>
    </div>
  );
};

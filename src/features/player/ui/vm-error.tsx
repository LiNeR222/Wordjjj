import { FC } from 'react';

import { SerializedError } from '@/shared/lib/serialized-error';

interface VMErrorProps {
  error: SerializedError | null;
}

export const VMError: FC<VMErrorProps> = ({ error }: VMErrorProps) => {
  if (!error) return null;
  console.log(SerializedError.toJSON(error));
  return (
    <div className='absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-[50]'>
      {error.status === 404 ? 'Видео не найдено. Попробуйте позже.' : error.message}
    </div>
  );
};

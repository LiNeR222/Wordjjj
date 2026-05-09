interface SwiperProgressProps {
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
}

export const SwiperProgress = ({ currentTime, duration, seek }: SwiperProgressProps) => {
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const boundingRect = e.currentTarget.getBoundingClientRect();
    const clickPosition = e.clientX - boundingRect.left;
    const newTime = (clickPosition / boundingRect.width) * duration;
    seek(newTime);
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className='absolute bottom-0 left-0 w-full z-40 bg-gray-300 cursor-pointer' onClick={handleSeek}>
      <span style={{ width: `${progress}%` }} className='block bg-white h-1.5'></span>
    </div>
  );
};

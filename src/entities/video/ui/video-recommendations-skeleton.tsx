'use client';
import { Skeleton } from 'antd';
import { getSkeletonsConfig } from '../config/get-skeletons-config';

export const VideoRecommendationsSkeleton = ({
  vertical = false,
  category = 'shorts',
}: {
  vertical?: boolean;
  category?: 'shorts' | 'videos';
}) => {
  // Конфигурация для разных типов скелетонов
  const currentConfig = getSkeletonsConfig({ vertical })?.[category];

  return (
    <div className={currentConfig.containerClass}>
      {[...Array(currentConfig.count)].map((_, index) => (
        <div className={currentConfig.itemClass} key={index}>
          {category === 'shorts' ? (
            <>
              <div className='w-[260px] h-[462px] rounded-2xl overflow-hidden'>
                <Skeleton.Image
                  active
                  style={{ width: '260px', height: '100%' }}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='flex items-start gap-x-2 mt-2'>
                <Skeleton.Avatar active size={24} shape='circle' style={{ minWidth: '24px' }} />
                <div className='flex flex-col flex-1 gap-1'>
                  {currentConfig.textConfig.map((cfg, i) => (
                    <Skeleton
                      key={i}
                      active
                      title={false}
                      paragraph={{
                        rows: cfg.rows,
                        width: '100%',
                        style: { height: `${cfg.height}px`, marginBottom: 0 },
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className='flex flex-col cursor-pointer rounded-2xl hover:bg-gray-100 p-2 w-full h-full'>
              <div className='relative w-full aspect-video rounded-2xl overflow-hidden'>
                <Skeleton.Image className='!w-full h-full' active style={{ height: '100%', width: '100%' }} />
              </div>
              <div className='flex flex-col gap-y-1 pt-2'>
                <Skeleton
                  active
                  title={false}
                  paragraph={{
                    rows: currentConfig.textConfig[0].rows,
                    width: '100%',
                    style: { height: `${currentConfig.textConfig[0].height}px`, marginBottom: 0 },
                  }}
                />
                <div className='flex items-center gap-x-2'>
                  <Skeleton.Avatar active size={24} shape='circle' style={{ minWidth: '24px' }} />
                  <div className='flex flex-col flex-1 gap-1'>
                    {currentConfig.textConfig.slice(1).map((cfg, i) => (
                      <Skeleton
                        key={i}
                        active
                        title={false}
                        paragraph={{
                          rows: cfg.rows,
                          width: '100%',
                          style: { height: `${cfg.height}px`, marginBottom: 0 },
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

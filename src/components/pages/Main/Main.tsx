'use client';

import { MainCatalogCategory } from '@/components/main-catalog-category';
import { Button, Input } from '@/components/ui';
import Image from 'next/image';
import { useState } from 'react';
import { IoIosClose, IoIosSearch } from 'react-icons/io';

export const Main: React.FC = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <div className='h-full bg-white p-6 pt-0 flex flex-col gap-4'>
      <section className='flex justify-between items-start flex-row'>
        {!isSearchVisible && <MainCatalogCategory />}
        <div className={`flex items-center gap-2 justify-end  ${isSearchVisible ? 'w-full' : 'w-auto'}`}>
          {isSearchVisible ? (
            <div className={`flex items-center gap-2 self-end  ${isSearchVisible ? 'w-full' : 'w-auto'}`}>
              <Input className='w-full transition-all duration-300' placeholder='Поиск...' />
              <Button onClick={toggleSearch}>
                <IoIosClose fontSize={20} />
              </Button>
            </div>
          ) : (
            <Button onClick={toggleSearch} className='w-auto md:hidden'>
              <IoIosSearch fontSize={20} />
            </Button>
          )}
        </div>
      </section>
      <section className='relative -mx-6'>
        <Image
          className='h-[400px] w-full object-cover object-top'
          height={400}
          width={1600}
          src='https://i.vimeocdn.com/video/1963574657-631176f0ffd56c75a37e9e4d36aadde1f68be7802ca7fc252fe3e028d6ed558b-d_960x540?r=pad'
          alt='poster'
        />
        <div className='absolute top-0 gap-y-4 z-10 px-6 pt-12 text-white'>
          <h1 className='font-semibold text-2xl tracking-tight'>
            Оформите пробную версию Premium для <br /> просмотра платных видео.
          </h1>
          <Button variant='default' className='!border-white mt-[24px]'>
            Месяц бесплатно
          </Button>
        </div>
      </section>
    </div>
  );
};

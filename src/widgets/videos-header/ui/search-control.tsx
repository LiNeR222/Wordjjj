'use client';

import { useSearchAppParams } from '@/shared/hooks';
import { Input } from '@/shared/ui/ant-input';
import { Button } from '@/shared/ui/button';
import { SearchOutlined } from '@ant-design/icons';
import { InputRef } from 'antd';
import clsx from 'clsx';
import { debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useMemo, useRef } from 'react';
import { IoIosClose, IoIosSearch } from 'react-icons/io';
import { RiEqualizerFill } from 'react-icons/ri';
import { videoHeaderStore } from '../model/video-header-store';
import { FilterTrigger } from './filter-trigger';
import { Suggestions } from './suggestions';
interface SearchControlProps {
  q?: string;
}

export const SearchControl: FC<SearchControlProps> = observer(({ q }) => {
  const { editSearchParams } = useSearchAppParams();
  const { toggleIsSearchActive, isSearchActive, setSearchValue, setIsSearchFocused } = videoHeaderStore;
  const inputRef = useRef<InputRef>(null);
  useEffect(() => {
    toggleIsSearchActive(Boolean(q));
    setSearchValue(q || '');
  }, [q, toggleIsSearchActive, setSearchValue]);

  const handleSearch = useMemo(() => debounce(async (q: string) => setSearchValue(q), 1000), [setSearchValue]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value);
  const handleToggleSearch = () => (
    isSearchActive && setTimeout(() => editSearchParams('remove', ['q']), 300), toggleIsSearchActive(!isSearchActive)
  );
  const handleEnter = () => {
    const value = inputRef.current?.input?.value;
    if (value) {
      editSearchParams('add', [['q', value]]);
    } else {
      editSearchParams('remove', ['q']);
    }
    inputRef.current?.blur();
  };
  const isSearchVisible = q || isSearchActive;

  return (
    <div className={`flex items-center gap-2 justify-end ${isSearchVisible ? 'w-full' : 'w-auto'}`}>
      {/*TODO: add ssr*/}
      <div className={clsx('relative transition-all ', isSearchVisible ? 'duration-1300 w-full' : 'w-0 mr-12')}>
        {isSearchVisible && (
          <>
            <Input
              ref={inputRef}
              className={clsx(
                'min-h-9 w-full !rounded-xl',
                'focus-within:!border-[#7B8AFF] focus-within:!border-2',
                'text-base [&_input::placeholder]:text-gray-500'
              )}
              placeholder='Поиск...'
              onChange={handleChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              defaultValue={q}
              onKeyDown={e => {
                if (e.key === 'Enter') handleEnter();
                if (e.key === 'Escape') inputRef.current?.blur();
              }}
              prefix={<SearchOutlined />}
              suffix={
                <FilterTrigger
                  /*ToDo сделать плавное появление*/
                  className={clsx(
                    'transition-opacity duration-1000 ease-linear',
                    isSearchVisible ? 'opacity-100' : 'opacity-0'
                  )}>
                  <RiEqualizerFill fontSize={16} />
                </FilterTrigger>
              }
            />

            <Suggestions />
          </>
        )}
      </div>

      <Button
        onClick={handleToggleSearch}
        className={clsx('max-[540px]:!px-2 transition-all', 'hover:border hover:border-gray-900')}>
        {isSearchVisible ? <IoIosClose fontSize={20} /> : <IoIosSearch fontSize={20} />}
      </Button>
    </div>
  );
});

import { FC, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { FormValues } from '../types';

interface TagFieldProps {
  name: 'tags' | 'categories';
}

export const TagField: FC<TagFieldProps> = ({ name }) => {
  const [inputValue, setInputValue] = useState('');

  const { control } = useFormContext<FormValues>();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name });

  const labelMap: Record<TagFieldProps['name'], string> = {
    tags: 'Теги',
    categories: 'Категории',
  };

  const placeholderMap: Record<TagFieldProps['name'], string> = {
    tags: 'Добавить тег',
    categories: 'Добавить категорию',
  };

  const handleRemoveTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }

    if (inputValue.trim() === '') return;
    
    if (event.key === ' ' || event.key === 'Enter') {
      const newTag = inputValue.trim();
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };

  return (
    <div className='w-full'>
      <div className='mb-2'>
        <div className='flex flex-wrap gap-2'>
          {value?.map((tag, index) => (
            <span key={index} className='px-2 py-1 bg-gray-200 text-xs rounded-md flex items-center gap-1'>
              {tag}
              <button type='button' onClick={() => handleRemoveTag(index)}>
                <FaTimes color='#6b6b6b' />
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className='border-gray-300 focus:border-gray-300 border rounded-xl transition-all cursor-pointer hover:border-gray-500'>
        <p className='px-3 pt-1 text-xs'>{labelMap[name]}</p>
        <div className='relative'>
          <input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderMap[name]}
            className='px-3 pt-0 py-1 w-full text-base outline-none rounded-xl'
          />
        </div>
      </div>
      {error && <span className='text-red-500 text-xs'>{error.message}</span>}
    </div>
  );
};

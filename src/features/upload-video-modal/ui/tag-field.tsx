import { useState } from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { ISubmitData } from '../types';

interface TagFieldProps extends UseControllerProps<ISubmitData, 'tags' | 'categories'> {
  label: string;
  placeholder: string;
}

function TagField(props: TagFieldProps) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController(props);

  const { label, placeholder } = props;
  const [inputValue, setInputValue] = useState('');

  const handleRemoveTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ' && inputValue.trim() !== '') {
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
          {value.map((tag, index) => (
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
        <p className='px-3 pt-1 text-xs'>{label}</p>
        <div className='relative'>
          <input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className='px-3 pt-0 py-1 w-full text-base outline-none rounded-xl'
          />
        </div>
      </div>
      {error && <span className='text-red-500 text-xs'>{error.message}</span>}
    </div>
  );
}

export default TagField;

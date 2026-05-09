import { AutoComplete } from 'antd';
import clsx from 'clsx';
import { debounce } from 'lodash';
import { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { fetchProducts } from '../lib/fetch-products';
import { FormValues } from '../types';
import styles from './style.module.css';
export const ProductField = () => {
  const { control } = useFormContext<FormValues>();
  const { field } = useController({ control, name: 'product_id' });
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const fetchAndSetOptions = async (value: string) => {
    const data = await fetchProducts(value);
    const suggestions = data.map((product: { id: number; name: string }) => ({
      value: product.id.toString(),
      label: product.name,
    }));
    setOptions(suggestions);
  };

  const handleSearch = debounce(async (value: string) => {
    await fetchAndSetOptions(value);
  }, 500);

  const handleSelect = (value: string, option: { value: string; label: string }) => {
    field.onChange(parseInt(value, 10));
    setSearchValue(option.label);
  };

  const handleChange = (value: string) => {
    setSearchValue(value);
    handleSearch(value);
  };

  const handleFocus = () => {
    if (searchValue.trim() === '') {
      handleSearch('');
    }
  };

  return (
    <div className='w-full relative'>
      <div className='w-full border-gray-300 focus:border-gray-300 border rounded-xl cursor-pointer transition-all hover:border-gray-500'>
        <p className='px-3 pt-1 text-xs'>Продукт (TableCRM)</p>
        <AutoComplete
          style={{ borderColor: 'transparent', boxShadow: 'none' }}
          value={searchValue}
          options={options}
          onChange={handleChange}
          onSelect={handleSelect}
          onFocus={handleFocus}
          placeholder='Введите название продукта и выберите предложенные'
          className={clsx('py-1 w-full text-base', styles.autocomplete)}
        />
      </div>
    </div>
  );
};

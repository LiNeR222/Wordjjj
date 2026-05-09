import { debounce } from 'lodash';
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { fetchData, handleSelectProduct } from '../lib/handle-products';
import { IProductResult } from '../upload-video-modal';

interface IProductFieldProps {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  results: IProductResult[];
  setResults: Dispatch<SetStateAction<IProductResult[]>>;
  setProductId: Dispatch<SetStateAction<number | null>>;
  showModal: boolean;
}

const ProductField: FC<IProductFieldProps> = ({ query, setQuery, results, setResults, setProductId, showModal }) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showModal) {
      setResults([]);
    }
  }, [showModal, setResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        const data = await fetch(
          `https://app.tablecrm.com/api/v1/nomenclature/?token=af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77&offset=0&limit=5&name=${value}`
        ).then(res => res.json());
        setResults(data.result || []);
      }, 800),
    [setResults]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setQuery(value);
    if (value) {
      handleSearch(value);
    }
  };

  const handleSelect = (result: IProductResult) => {
    handleSelectProduct(result, setProductId, setQuery, setResults);
    setShowMenu(false);
  };

  const handleFocus = () => {
    if (!query) {
      fetchData(setResults);
    }
    setShowMenu(true);
  };

  return (
    <div className='w-full relative'>
      <div className='w-full border-gray-300 focus:border-gray-300 border rounded-xl transition-all cursor-pointer transition-all hover:border-gray-500'>
        <p className='px-3 pt-1 text-xs'>Продукт (TableCRM)</p>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder='Введите название продукта и выберите предложенные'
          className='px-3 pt-0 py-1 w-full text-base outline-none rounded-xl'
        />
      </div>
      {showMenu && results.length > 0 && (
        <ul
          ref={menuRef}
          className='absolute w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden z-50'>
          {results.map((result, index) => (
            <li
              key={index}
              className='px-4 py-2 cursor-pointer hover:bg-gray-100 transition-all'
              onClick={() => handleSelect(result)}>
              {result.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductField;

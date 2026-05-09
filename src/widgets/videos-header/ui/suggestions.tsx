import { useSearchAppParams } from '@/shared/hooks';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { suggestionsStore } from '../model/suggestions-store';

export const Suggestions = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const { editSearchParams, getSearchParamValue } = useSearchAppParams();
  const { suggestions, searchValue, isSearchFocused } = suggestionsStore;
  const q = getSearchParamValue('q') || '';

  useEffect(() => {
    setTimeout(() => setIsOpen(isSearchFocused), 200);
  }, [isSearchFocused]);

  useEffect(() => {
    if (searchValue && suggestionsStore.instance === null) {
      suggestionsStore.askSuggestions(searchValue);
    }
  }, [searchValue]);

  const handleSearch = (value: string) => {
    if (value) {
      editSearchParams('add', [['q', value]]);
    } else {
      editSearchParams('remove', ['q']);
    }
  };

  // if suggestions.instance === null

  if (!isOpen || (searchValue === q && !searchValue)) {
    return null;
  }

  return (
    <ul className='absolute w-full bg-white shadow-lg rounded-b-lg mt-1 overflow-hidden z-40'>
      {suggestions.map((item, index) => (
        <li key={index} className='px-4 py-2 cursor-pointer hover:bg-gray-100' onClick={() => handleSearch(item)}>
          {item}
        </li>
      ))}
      {searchValue !== q && (
        <li
          className='px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-500 text-left'
          onClick={() => handleSearch(searchValue)}>
          {searchValue}
        </li>
      )}
    </ul>
  );
});

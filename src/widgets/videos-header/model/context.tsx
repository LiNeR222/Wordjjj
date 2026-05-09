'use client';
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

export interface SearchContextType {
  isSearchVisible: boolean;
  setIsSearchVisible: Dispatch<SetStateAction<boolean>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);

  return <SearchContext.Provider value={{ isSearchVisible, setIsSearchVisible }}>{children}</SearchContext.Provider>;
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('context is not defined');
  }
  return context;
};

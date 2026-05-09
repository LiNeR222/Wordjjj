'use client';
import { createContext, useContext, useState } from 'react';
import { DataContextType, DataProviderProps, DataState } from '../../types';

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialDataState: DataState = {
  isGrid: false,
};

export function DataProvider({ children }: DataProviderProps) {
  const [data, setData] = useState<DataState>(initialDataState);

  return <DataContext.Provider value={{ data, setData }}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData должен использоваться внутри DataProvider');
  }
  return context;
}

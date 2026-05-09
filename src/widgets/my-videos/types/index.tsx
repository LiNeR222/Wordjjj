import { Dispatch, ReactNode, SetStateAction } from 'react';

export interface DataContextType {
  data: DataState;
  setData: Dispatch<SetStateAction<DataState>>;
}

export interface DataProviderProps {
  children: ReactNode;
}

export interface DataState {
  isGrid: boolean;
}

import { createContext, useContext } from 'react';
import { CurrentUserStore } from '../model/current-user-store';

export const CurrentUserStoreContext = createContext<CurrentUserStore | null>(null);

export const useCurrentUserStore = () => {
  return useContext(CurrentUserStoreContext);
};

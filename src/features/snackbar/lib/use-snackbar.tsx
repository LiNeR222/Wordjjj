'use client';
import React, { createContext, useContext, useState } from 'react';
import { SnackbarProps } from '../types';
import { Snackbar } from '../ui/snackbar';

interface SnackbarContextType {
  showSnackbar: (snackbarProps: SnackbarProps) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackbarArray, setSnackbarArray] = useState<(SnackbarProps & { id: string })[]>([]);

  const removeSnackbar = (id: string) => {
    setSnackbarArray(prev => prev.filter(snackbar => snackbar.id !== id));
  };

  const showSnackbar = ({ duration, ...rest }: SnackbarProps) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setSnackbarArray(prev => [...prev, { id, duration, ...rest }]);

    setTimeout(() => {
      removeSnackbar(id);
    }, duration);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div className='fixed w-full top-0 left-0 z-[500]'>
        {snackbarArray.map(({ id, ...options }) => (
          <Snackbar key={id} {...options} onClose={() => removeSnackbar(id)} />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

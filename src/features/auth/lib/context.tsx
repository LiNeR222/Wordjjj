'use client';
import React, { createContext, useContext, useState } from 'react';
import { useClientSession } from '../hooks/useClientSession';
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  useClientSession({ showModal, setShowModal });

  return <AuthContext.Provider value={{ showModal, setShowModal }}>{children}</AuthContext.Provider>;
};

export const useAuthModal = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthContextProvider');
  }
  return context;
};

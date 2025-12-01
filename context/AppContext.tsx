'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for context state
interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
}

interface AppContextType {
  currentUser: DemoUser | null;
  currentAccount: Account | null;
  setCurrentUser: (user: DemoUser | null) => void;
  setCurrentAccount: (account: Account | null) => void;
}

// Create context with default values
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentAccount,
        setCurrentUser,
        setCurrentAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

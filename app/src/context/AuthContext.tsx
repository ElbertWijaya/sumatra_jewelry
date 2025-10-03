// Deprecated legacy AuthContext – use @lib/context/AuthContext instead.
import React, { createContext, useContext } from 'react';

interface LegacyAuthValue { warning: string }
const LegacyAuthContext = createContext<LegacyAuthValue>({ warning: 'Legacy AuthContext removed. Use new provider.' });

export const LegacyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LegacyAuthContext.Provider value={{ warning: 'Legacy AuthContext removed. Use new provider.' }}>
    {children}
  </LegacyAuthContext.Provider>
);

export function useAuth() {
  console.warn('useAuth from legacy context called. Switch to @lib/context/AuthContext');
  return { token: null, user: null } as any;
}

export default LegacyAuthProvider;

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '@lib/api/client';

interface AuthState {
  token: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.accessToken);
    // Pastikan jobRole selalu ada di user context
    setUser({
      ...data.user,
      jobRole: data.user.jobRole || data.user.job_role || null
    });
    await SecureStore.setItemAsync('token', data.accessToken);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('token');
  }, []);

  return <AuthCtx.Provider value={{ token, user, login, logout, setUser }}>{children}</AuthCtx.Provider>;}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, getApiBase } from '@lib/api/client';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import * as RT from '@lib/realtime';

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
  const [rtStatus, setRtStatus] = useState<'connected'|'disconnected'|'connecting'|'error'>('disconnected');
  const qc = useQueryClient();
  const lastTokenRef = useRef<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Preflight connectivity against health endpoint to avoid misleading 404 on /api
      await api.ping();
    } catch (e: any) {
      throw new Error(`Tidak bisa terhubung ke API (${getApiBase()}). Coba akses /api/health dari HP. Jika gagal, periksa IP server, port 3000, dan firewall.`);
    }
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
    RT.disconnect();
  }, []);

  // Establish realtime connection when token changes
  useEffect(() => {
    if (token && token !== lastTokenRef.current) {
      lastTokenRef.current = token;
      RT.connect(token, qc as QueryClient, { onStatusChange: setRtStatus, reconnect: true });
    } else if (!token) {
      lastTokenRef.current = null;
      RT.disconnect();
      setRtStatus('disconnected');
    }
  }, [token, qc]);

  // Expose current realtime status (optional future UI usage)
  const value = { token, user, login, logout, setUser } as any;
  value.realtimeStatus = rtStatus;

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

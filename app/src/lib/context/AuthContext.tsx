import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, getApiBase } from '@lib/api/client';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import * as RT from '@lib/realtime';
import { registerPushTokenWithBackend } from '@lib/notify';

interface AuthState {
  token: string | null;
  user: any | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
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

  const login = useCallback(async (email: string, password: string, remember: boolean = false) => {
    try {
      // Preflight connectivity against health endpoint to avoid misleading 404 on /api
      await api.ping();
    } catch (e: any) {
      throw new Error(`Tidak bisa terhubung ke API (${getApiBase()}). Coba akses /api/health dari HP. Jika gagal, periksa IP server, port 3000, dan firewall.`);
    }
    const data = await api.login(email, password);
    if (__DEV__) {
      try {
        console.log('[AUTH LOGIN] user', {
          id: data?.user?.id,
          email: data?.user?.email,
          fullName: data?.user?.fullName || data?.user?.full_name || data?.user?.name,
          jobRole: data?.user?.jobRole || data?.user?.job_role,
        });
        console.log('[AUTH LOGIN] tokenLen', (data?.accessToken || '').length);
      } catch {}
    }
    setToken(data.accessToken);
    // Pastikan jobRole selalu ada di user context
    const nextUser = {
      ...data.user,
      jobRole: data.user.jobRole || data.user.job_role || null,
      fullName: data.user.fullName || data.user.full_name || data.user.name || null
    };
    setUser(nextUser);
    if (remember) {
      await SecureStore.setItemAsync('token', data.accessToken);
      try { await SecureStore.setItemAsync('user', JSON.stringify(nextUser)); } catch {}
    } else {
      // Ensure previous persisted token is cleared for non-remember sessions
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    RT.disconnect();
  }, []);

  // Establish realtime connection when token changes
  useEffect(() => {
    if (token && token !== lastTokenRef.current) {
      lastTokenRef.current = token;
      RT.connect(token, qc as QueryClient, { onStatusChange: setRtStatus, reconnect: true });
      // Register push token in background; ignore errors
      (async () => { try { await registerPushTokenWithBackend(token); } catch {} })();
    } else if (!token) {
      lastTokenRef.current = null;
      RT.disconnect();
      setRtStatus('disconnected');
    }
  }, [token, qc]);

  // Rehydrate persisted token and user at app start
  useEffect(() => {
    (async () => {
      try {
        const persistedToken = await SecureStore.getItemAsync('token');
        const persistedUserStr = await SecureStore.getItemAsync('user');
        if (__DEV__) {
          console.log('[AUTH REHYDRATE] hasToken', !!persistedToken, 'hasUser', !!persistedUserStr);
        }
        if (persistedToken) setToken(persistedToken);
        if (persistedUserStr) {
          try {
            const persistedUser = JSON.parse(persistedUserStr);
            setUser(persistedUser);
          } catch {}
        }
      } catch {}
    })();
  }, []);

  // Sync user from backend when token becomes available (ensures latest role/profile)
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const extractUser = (raw: any) => {
          if (!raw || typeof raw !== 'object') return null;
          const candidate = raw.user && typeof raw.user === 'object' ? raw.user
            : raw.data && typeof raw.data === 'object' ? raw.data
            : raw.result && typeof raw.result === 'object' ? raw.result
            : raw.profile && typeof raw.profile === 'object' ? raw.profile
            : raw;
          if (!candidate || typeof candidate !== 'object') return null;
          const normalized = {
            id: candidate.id || candidate._id || candidate.uuid || candidate.userId || null,
            email: candidate.email || candidate.username || candidate.user_name || null,
            jobRole: candidate.jobRole || candidate.job_role || candidate.role || candidate.userRole || null,
            fullName: candidate.fullName || candidate.full_name || candidate.name || candidate.displayName || candidate.display_name || null,
            ...candidate,
          };
          const valid = !!(normalized.id || normalized.email || normalized.fullName);
          return valid ? normalized : null;
        };

        let rawMe: any = null;
        try { rawMe = await api.users.me(token); } catch (e) { rawMe = null; }
        let normalized = extractUser(rawMe);

        // Fallback ke /auth/me jika /users/me tidak memberikan struktur yang diharapkan
        if (!normalized) {
          try { rawMe = await api.auth.me(token); } catch (e) { rawMe = null; }
          normalized = extractUser(rawMe);
        }

        if (__DEV__) {
          console.log('[USERS ME][raw]', rawMe);
          console.log('[USERS ME][normalized]', normalized);
        }

        if (normalized) {
          setUser(normalized);
          try {
            const persistedToken = await SecureStore.getItemAsync('token');
            if (persistedToken) {
              await SecureStore.setItemAsync('user', JSON.stringify(normalized));
            }
          } catch {}
        } else {
          // Jika data tidak valid, jangan timpa user yang sudah ada dari login/rehydrate
          if (__DEV__) console.warn('[USERS ME] Data tidak valid, skip overwrite user');
        }
      } catch (e) {
        // ignore sync error to avoid blocking app start
      }
    })();
  }, [token]);

  // Expose current realtime status (optional future UI usage)
  const value = { token, user, login, logout, setUser } as any;
  value.realtimeStatus = rtStatus;

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { Platform } from 'react-native';

const RAW_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
// Android emulator tidak bisa akses host via 'localhost', harus 10.0.2.2
export const API_URL = (Platform.OS === 'android' && RAW_BASE.includes('localhost'))
  ? RAW_BASE.replace('localhost', '10.0.2.2')
  : RAW_BASE;

async function request(path: string, options: RequestInit = {}) {
  let url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  orders: {
    list: (token: string) => request('/orders', { headers: { Authorization: `Bearer ${token}` } }),
  create: (token: string, payload: any) => request('/orders', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } }),
  },
};

import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Otomatis tentukan BASE sesuai permintaan:
// - Emulator Android: 10.0.2.2:3000/api
// - Device fisik Android / iOS: 192.168.100.45:3000/api
// - iOS simulator & web fallback: gunakan localhost atau env jika ada
// Lingkungan masih bisa di-override via EXPO_PUBLIC_API_URL bila disediakan.

const LAN_BASE = 'http://192.168.110.63:3000/api';
const ANDROID_EMULATOR_BASE = 'http://10.0.2.2:3000/api';

function computeAutoBase() {
  const envOverride = process.env.EXPO_PUBLIC_API_URL;
  if (envOverride) return normalizeBase(envOverride);
  if (Platform.OS === 'android') {
    return Device.isDevice ? LAN_BASE : ANDROID_EMULATOR_BASE;
  }
  if (Platform.OS === 'ios') {
    return Device.isDevice ? LAN_BASE : 'http://localhost:3000/api';
  }
  return LAN_BASE; // default untuk platform lain (web, dll)
}

function normalizeBase(raw: string) {
  let b = raw.trim();
  if (!/^https?:\/\//i.test(b)) b = 'http://' + b;
  b = b.replace(/\/$/, '');
  if (!b.endsWith('/api')) b += '/api';
  return b;
}

export const API_URL = computeAutoBase();

// Dynamic override masih disediakan jika nanti diperlukan (misal debug):
let dynamicBase: string | null = null;
export function setApiBase(url: string) {
  if (!url) return;
  dynamicBase = normalizeBase(url);
  console.log('[API] Dynamic Base set ->', dynamicBase);
}
export function getApiBase() { return dynamicBase || API_URL; }

let loggedBase = false;
if (!loggedBase) {
  // Satu kali log untuk debugging di device fisik
  console.log('[API] Base URL (initial):', API_URL);
  loggedBase = true;
}

async function request(path: string, options: RequestInit = {}) {
  const base = getApiBase();
  const url = `${base}${path}`;
  const controller = new AbortController();
  const TIMEOUT_MS = 12000;
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  } catch (e: any) {
    if (e.name === 'AbortError') {
  throw new Error(`Tidak bisa terhubung ke server (${base}). Pastikan device & server 1 jaringan, server listen 0.0.0.0, firewall open.`);
    }
    if (e.message && (e.message.includes('Network request failed') || e.message.includes('Failed to fetch'))) {
  throw new Error(`Gagal konek ke API (${base}). Periksa koneksi LAN & IP server.`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

export const api = {
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  orders: {
    list: (token: string) => request('/orders', { headers: { Authorization: `Bearer ${token}` } }),
  get: (token: string, id: number) => request(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  create: (token: string, payload: any) => request('/orders', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } }),
  },
  tasks: {
    list: (token: string) => request('/tasks', { headers: { Authorization: `Bearer ${token}` } }),
    awaitingValidation: (token: string, orderId: number) => request(`/tasks/awaiting-validation?orderId=${orderId}`, { headers: { Authorization: `Bearer ${token}` } }),
    create: (token: string, payload: { orderId: number; stage?: string; notes?: string }) => request('/tasks', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } }),
    update: (token: string, id: number, patch: any) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { Authorization: `Bearer ${token}` } }),
    remove: (token: string, id: number) => request(`/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    assign: (token: string, id: number, assignedToId: string) => request(`/tasks/${id}/assign`, { method: 'POST', body: JSON.stringify({ assignedToId }), headers: { Authorization: `Bearer ${token}` } }),
    assignBulk: (token: string, payload: { orderId: number; role: string; userId: string; subtasks: { stage?: string; notes?: string }[] }) => request('/tasks/assign-bulk', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } }),
    requestDone: (token: string, id: number, notes?: string) => request(`/tasks/${id}/request-done`, { method: 'POST', body: JSON.stringify({ notes }), headers: { Authorization: `Bearer ${token}` } }),
    validate: (token: string, id: number, notes?: string) => request(`/tasks/${id}/validate`, { method: 'POST', body: JSON.stringify({ notes }), headers: { Authorization: `Bearer ${token}` } }),
  },
  users: {
    list: (token: string, opts?: { jobRole?: string }) => {
      const params: string[] = [];
      if (opts?.jobRole) params.push(`jobRole=${encodeURIComponent(opts.jobRole)}`);
      const q = params.length ? `?${params.join('&')}` : '';
      return request(`/users${q}`, { headers: { Authorization: `Bearer ${token}` } });
    },
  }
};

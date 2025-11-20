import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

const LAN_BASE = 'http://192.168.110.63:3000/api';
const ANDROID_EMULATOR_BASE = 'http://10.0.2.2:3000/api';

function getDevHostIp(): string | null {
  try {
    const c: any = Constants as any;
    const host: string | undefined = c?.expoConfig?.hostUri || c?.manifest2?.extra?.expoGo?.debuggerHost || c?.manifest?.debuggerHost;
    if (host && typeof host === 'string') {
      const h = host.split(':')[0];
      if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return h;
    }
  } catch {}
  return null;
}

function normalizeBase(raw: string) {
  let b = raw.trim();
  if (!/^https?:\/\//i.test(b)) b = 'http://' + b;
  b = b.replace(/\/$/, '');
  if (!b.endsWith('/api')) b += '/api';
  return b;
}

function computeAutoBase() {
  const envOverride = process.env.EXPO_PUBLIC_API_URL;
  if (envOverride) return normalizeBase(envOverride);
  const devIp = getDevHostIp();
  if (__DEV__ && devIp) return normalizeBase(`http://${devIp}:3000/api`);
  if (Platform.OS === 'android') {
    return Device.isDevice ? LAN_BASE : ANDROID_EMULATOR_BASE;
  }
  if (Platform.OS === 'ios') {
    return Device.isDevice ? LAN_BASE : 'http://localhost:3000/api';
  }
  return LAN_BASE;
}

export const API_URL = computeAutoBase();
let dynamicBase: string | null = null;
export function setApiBase(url: string) { if (!url) return; dynamicBase = normalizeBase(url); console.log('[API] Dynamic Base set ->', dynamicBase); }
export function getApiBase() { return dynamicBase || API_URL; }

let loggedBase = false;
if (!loggedBase) { console.log('[API] Base URL (initial):', API_URL); loggedBase = true; }

async function request(path: string, options: RequestInit = {}) {
  const base = getApiBase();
  const url = `${base}${path}`;
  const controller = new AbortController();
  const TIMEOUT_MS = 12000;
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const mergedHeaders: any = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, { ...options, headers: mergedHeaders, signal: controller.signal });
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
    update: (token: string, id: number, patch: any) => request(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { Authorization: `Bearer ${token}` } }),
    remove: (token: string, id: number) => request(`/orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    create: (token: string, payload: any) => request('/orders', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } }),
    updateStatus: (token: string, id: number, status: string) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), headers: { Authorization: `Bearer ${token}` } }),
  },
  tasks: {
    list: (token: string) => request('/tasks', { headers: { Authorization: `Bearer ${token}` } }),
    listByOrder: (token: string, orderId: number) => request(`/tasks/order/${orderId}`, { headers: { Authorization: `Bearer ${token}` } }),
    awaitingValidation: (token: string, orderId: number) => request(`/tasks/awaiting-validation?orderId=${orderId}`, { headers: { Authorization: `Bearer ${token}` } }),
    create: (token: string, payload: { orderId: number; stage?: string; notes?: string }) => request('/tasks', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } }),
    update: (token: string, id: number, patch: any) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { Authorization: `Bearer ${token}` } }),
    remove: (token: string, id: number) => request(`/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    assign: (token: string, id: number, assignedToId: string) => request(`/tasks/${id}/assign`, { method: 'POST', body: JSON.stringify({ assignedToId }), headers: { Authorization: `Bearer ${token}` } }),
    assignBulk: (token: string, payload: { orderId: number; role: string; userId: string; subtasks: { stage?: string; notes?: string }[] }) => request('/tasks/assign-bulk', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } }),
    requestDone: (token: string, id: number, notes?: string) => request(`/tasks/${id}/request-done`, { method: 'POST', body: JSON.stringify({ notes }), headers: { Authorization: `Bearer ${token}` } }),
    requestDoneMine: (token: string, orderId: number, notes?: string) => request(`/tasks/order/${orderId}/request-done-mine`, { method: 'POST', body: JSON.stringify({ notes }), headers: { Authorization: `Bearer ${token}` } }),
    validate: (token: string, id: number, notes?: string) => request(`/tasks/${id}/validate`, { method: 'POST', body: JSON.stringify({ notes }), headers: { Authorization: `Bearer ${token}` } }),
    validateUserForOrder: (token: string, orderId: number, userId: string, notes?: string) => request(`/tasks/order/${orderId}/validate-user/${userId}`, { method: 'POST', body: JSON.stringify({ notes }), headers: { Authorization: `Bearer ${token}` } }),
    start: (token: string, id: number) => request(`/tasks/${id}/start`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
    check: (token: string, id: number) => request(`/tasks/${id}/check`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
    uncheck: (token: string, id: number) => request(`/tasks/${id}/uncheck`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
    acceptMine: (token: string, orderId: number) => request(`/tasks/order/${orderId}/accept-mine`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  },
  users: {
    list: (token: string, opts?: { jobRole?: string }) => {
      const params: string[] = [];
      if (opts?.jobRole) params.push(`jobRole=${encodeURIComponent(opts.jobRole)}`);
      const q = params.length ? `?${params.join('&')}` : '';
      return request(`/users${q}`, { headers: { Authorization: `Bearer ${token}` } });
    },
    updateMe: (token: string, data: { avatar?: string; phone?: string; address?: string; branchName?: string; branchAddress?: string }) => request('/users/me', { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
    changePassword: (token: string, data: { oldPassword: string; newPassword: string }) => request('/users/me/password', { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
  },
  files: {
    upload: (token: string, form: FormData) => fetch(`${getApiBase()}/files/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }).then(r=> r.ok ? r.json() : r.text().then(t=>{ throw new Error(t); }))
  },
  dashboard: {
    stats: (token: string) => request('/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
  },
  inventory: {
    get: (token: string, id: number) => request(`/inventory/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
    listByOrder: (token: string, orderId: number) => request(`/inventory?orderId=${orderId}`, { headers: { Authorization: `Bearer ${token}` } }),
    search: (token: string, params?: { q?: string; category?: string; status?: string; branchLocation?: string; placement?: string; statusEnum?: string; dateFrom?: string; dateTo?: string; limit?: number; offset?: number }) => {
      const p = new URLSearchParams();
      if (params?.q) p.set('q', params.q);
      if (params?.category) p.set('category', params.category);
      if (params?.status) p.set('status', params.status);
      if (params?.branchLocation) p.set('branchLocation', params.branchLocation);
      if (params?.placement) p.set('placement', params.placement);
      if (params?.statusEnum) p.set('statusEnum', params.statusEnum);
      if (params?.dateFrom) p.set('dateFrom', params.dateFrom);
      if (params?.dateTo) p.set('dateTo', params.dateTo);
      if (params?.limit != null) p.set('limit', String(params.limit));
      if (params?.offset != null) p.set('offset', String(params.offset));
      const qs = p.toString();
      const path = `/inventory/items/search/all${qs ? `?${qs}` : ''}`;
      return request(path, { headers: { Authorization: `Bearer ${token}` } });
    },
    requests: (token: string) => request('/inventory/requests/list', { headers: { Authorization: `Bearer ${token}` } }),
    create: (token: string, payload: any) => request('/inventory', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } }),
    update: (token: string, id: number, patch: any) => request(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { Authorization: `Bearer ${token}` } }),
    history: (token: string, id: number) => request(`/inventory/${id}/history`, { headers: { Authorization: `Bearer ${token}` } }),
  }
};

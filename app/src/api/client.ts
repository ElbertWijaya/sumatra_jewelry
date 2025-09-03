export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
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

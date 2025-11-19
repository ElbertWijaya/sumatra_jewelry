import { getApiBase } from '../api/client';
import { QueryClient } from '@tanstack/react-query';

export type RealtimeEvent =
  | { type: 'order.updated'; orderId: number }
  | { type: 'order.deleted'; orderId: number }
  | { type: 'task.updated'; taskId: number; orderId?: number }
  | { type: 'task.statusChanged'; taskId: number; status: string; orderId?: number }
  | { type: 'inventory.created'; itemId: number; orderId?: number }
  | { type: 'inventory.updated'; itemId: number; orderId?: number };

export interface RealtimeOptions {
  token: string;
  queryClient: QueryClient;
  onStatusChange?: (s: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
  reconnect?: boolean;
}

let socket: WebSocket | null = null;
let currentToken: string | null = null;
let reconnectAttempts = 0;
let optsRef: RealtimeOptions | null = null;
let reconnectTimer: any = null;

function buildWsUrl(): string {
  const base = getApiBase();
  // convert http(s)://host:port/api -> ws(s)://host:port/ws
  const u = new URL(base);
  const protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  // assume backend exposes a /ws endpoint for realtime
  return protocol + '//' + u.host + '/ws';
}

function scheduleReconnect() {
  if (!optsRef || !optsRef.reconnect) return;
  if (reconnectTimer) return;
  const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts)); // exponential backoff up to 30s
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    reconnectAttempts++;
      if (currentToken && optsRef) {
        connect(currentToken, optsRef.queryClient, { reconnect: optsRef.reconnect, onStatusChange: optsRef.onStatusChange });
    }
  }, delay);
}

function handleMessage(raw: MessageEvent<any>) {
  let data: any;
  try { data = JSON.parse(raw.data); } catch { return; }
  if (!data || typeof data.type !== 'string') return;
  const qc = optsRef?.queryClient;
  if (!qc) return;
  const type: string = data.type;
  switch (type) {
    case 'ping': {
      // optionally respond with pong
      socket?.send(JSON.stringify({ type: 'pong' }));
      break;
    }
    case 'order.updated': {
      const orderId = Number(data.orderId);
      qc.invalidateQueries({ queryKey: ['orders','inprogress'] });
      qc.invalidateQueries({ queryKey: ['orders','inprogress','home'] });
      qc.invalidateQueries({ queryKey: ['order', orderId] });
      qc.invalidateQueries({ queryKey: ['orders','history'] });
      break;
    }
    case 'order.deleted': {
      qc.invalidateQueries({ queryKey: ['orders','inprogress'] });
      qc.invalidateQueries({ queryKey: ['orders','inprogress','home'] });
      qc.invalidateQueries({ queryKey: ['orders','history'] });
      break;
    }
    case 'task.updated':
    case 'task.statusChanged': {
      const orderId = data.orderId ? Number(data.orderId) : undefined;
      qc.invalidateQueries({ queryKey: ['tasks','active'] });
      qc.invalidateQueries({ queryKey: ['tasks','home'] });
      if (orderId) {
        qc.invalidateQueries({ queryKey: ['tasks','order', orderId] });
        qc.invalidateQueries({ queryKey: ['order-verif', orderId] });
        qc.invalidateQueries({ queryKey: ['tasks','awaiting', orderId] });
      }
      // Orders may change derived indicators
      qc.invalidateQueries({ queryKey: ['orders','inprogress','home'] });
      break;
    }
    case 'inventory.created':
    case 'inventory.updated': {
      const itemId = data.itemId ? Number(data.itemId) : undefined;
      const orderId = data.orderId ? Number(data.orderId) : undefined;
      // Invalidate inventory requests and lists
      qc.invalidateQueries({ queryKey: ['inventory','requests'] });
      qc.invalidateQueries({ queryKey: ['inventory','requests','count'] });
      qc.invalidateQueries({ queryKey: ['inventory','list'] });
      if (orderId) {
        qc.invalidateQueries({ queryKey: ['inventory','order', orderId] });
      }
      if (itemId) {
        qc.invalidateQueries({ queryKey: ['inventory','detail', itemId] });
      }
      break;
    }
    default:
      break;
  }
}

export function connect(token: string, queryClient: QueryClient, options?: Partial<RealtimeOptions>) {
  currentToken = token;
  optsRef = { token, queryClient, reconnect: true, ...(options || {}) } as RealtimeOptions;
  if (socket) {
    try { socket.close(); } catch {}
    socket = null;
  }
  optsRef.onStatusChange?.('connecting');
  const url = buildWsUrl();
  const wsUrl = url + `?token=${encodeURIComponent(token)}`;
  socket = new WebSocket(wsUrl);
  socket.onopen = () => {
    reconnectAttempts = 0;
    optsRef?.onStatusChange?.('connected');
    // optional auth confirm
    socket?.send(JSON.stringify({ type: 'auth', token }));
  };
  socket.onmessage = handleMessage;
  socket.onerror = () => {
    optsRef?.onStatusChange?.('error');
  };
  socket.onclose = () => {
    optsRef?.onStatusChange?.('disconnected');
    scheduleReconnect();
  };
  return socket;
}

export function disconnect() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  reconnectAttempts = 0;
  if (socket) {
    try { socket.close(); } catch {}
    socket = null;
  }
  optsRef?.onStatusChange?.('disconnected');
}

export function getStatus(): 'connected'|'disconnected'|'connecting'|'error' {
  if (!socket) return 'disconnected';
  switch (socket.readyState) {
    case WebSocket.CONNECTING: return 'connecting';
    case WebSocket.OPEN: return 'connected';
    case WebSocket.CLOSING: return 'connecting';
    case WebSocket.CLOSED: return 'disconnected';
    default: return 'disconnected';
  }
}

// For manual push (e.g., dev tools)
export function send(obj: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(obj));
  }
}

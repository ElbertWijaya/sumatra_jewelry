import { io, Socket } from 'socket.io-client';
import { getApiBase } from '../api/client';

function getSocketBase() {
  const base = getApiBase();
  return base.endsWith('/api') ? base.slice(0, -4) : base;
}

export function connectSocket(userId: string): Socket {
  const url = getSocketBase();
  const socket = io(url, {
    transports: ['websocket'],
    auth: { userId },
  });
  return socket;
}

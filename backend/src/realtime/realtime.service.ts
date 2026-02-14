import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { INestApplication } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
// Use require to avoid type errors if types missing at build time
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebSocketLib = require('ws');

interface ClientMeta { ws: any; userId?: string; jobRole?: string | null }

@Injectable()
export class RealtimeService {
  private wss: any | null = null;
  private clients = new Set<ClientMeta>();
  private secret: string;

  constructor(private config: ConfigService) {
  const secret = this.config.get<string>('JWT_SECRET');
  if (!secret) {
    // Do not allow realtime channel to run with a hard-coded or empty secret
    throw new Error('JWT_SECRET is not configured for RealtimeService');
  }
  this.secret = secret;
  }

  init(app: INestApplication) {
    if (this.wss) return;
    const server: any = (app as any).getHttpServer();
    const WebSocketServer = WebSocketLib.WebSocketServer || WebSocketLib.Server || WebSocketLib;
    this.wss = new WebSocketServer({ noServer: true });

    this.wss.on('connection', (ws: any, req: any, user: { sub?: string; jobRole?: string | null } | null) => {
      const meta: ClientMeta = { ws, userId: user?.sub, jobRole: user?.jobRole ?? null };
      this.clients.add(meta);
      ws.on('close', () => {
        this.clients.delete(meta);
      });
      ws.on('message', (raw: any) => {
        try {
          const msg = JSON.parse(String(raw));
          if (msg?.type === 'pong') return;
        } catch {}
      });
    });

    server.on('upgrade', (req: any, socket: any, head: any) => {
      try {
        const url = new URL(req.url || '/ws', 'http://localhost');
        if (!url.pathname || !url.pathname.startsWith('/ws')) return socket.destroy();
        const token = url.searchParams.get('token');
        if (!token) return socket.destroy();
        let user: any = null;
        try { user = jwt.verify(token, this.secret); } catch { return socket.destroy(); }
        this.wss.handleUpgrade(req, socket, head, (ws: any) => {
          this.wss.emit('connection', ws, req, user);
        });
      } catch {
        try { socket.destroy(); } catch {}
      }
    });
  }

  emitAll(event: any) {
    const data = JSON.stringify(event);
    for (const c of this.clients) {
      try {
        if (c.ws.readyState === WebSocketLib.OPEN || c.ws.readyState === 1) {
          c.ws.send(data);
        }
      } catch {}
    }
  }

  emitToRole(role: string, event: any) {
    const data = JSON.stringify(event);
    for (const c of this.clients) {
      try {
        if ((c.jobRole || '').toUpperCase() !== role.toUpperCase()) continue;
        if (c.ws.readyState === WebSocketLib.OPEN || c.ws.readyState === 1) {
          c.ws.send(data);
        }
      } catch {}
    }
  }

  emitToUser(userId: string, event: any) {
    const data = JSON.stringify(event);
    for (const c of this.clients) {
      try {
        if (c.userId !== userId) continue;
        if (c.ws.readyState === WebSocketLib.OPEN || c.ws.readyState === 1) {
          c.ws.send(data);
        }
      } catch {}
    }
  }
}

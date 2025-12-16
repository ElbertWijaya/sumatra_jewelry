import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

type PushMessage = { title: string; body: string; data?: Record<string, any> };

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private fcmKey: string | null;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.fcmKey = this.config.get<string>('FCM_SERVER_KEY') || null;
  }

  async register(userId: string, token: string, provider: 'expo'|'fcm', platform?: string) {
    if (!token) return { ok: false };
    await this.prisma.pushtoken.upsert({
      where: { token },
      update: { userId, provider, platform: platform || null },
      create: { userId, token, provider, platform: platform || null },
    });
    return { ok: true };
  }

  async unregister(token: string) {
    try { await this.prisma.pushtoken.delete({ where: { token } }); } catch {}
    return { ok: true };
  }

  async notifyUser(userId: string, msg: PushMessage) {
    const tokens = await this.prisma.pushtoken.findMany({
      where: { userId },
      select: { token: true, provider: true },
    });
    if (!tokens.length) return { sent: 0 };
    const expo = tokens.filter((t: { provider: string; token: string }) => t.provider === 'expo').map((t: { token: string }) => t.token);
    const fcm = tokens.filter((t: { provider: string; token: string }) => t.provider === 'fcm').map((t: { token: string }) => t.token);
    let sent = 0;
    if (expo.length) {
      try { sent += await this.sendExpo(expo, msg); } catch (e) { this.logger.warn('Expo push failed: ' + (e as any)?.message); }
    }
    if (fcm.length) {
      try { sent += await this.sendFcm(fcm, msg); } catch (e) { this.logger.warn('FCM push failed: ' + (e as any)?.message); }
    }
    return { sent };
  }

  private async sendExpo(tokens: string[], msg: PushMessage): Promise<number> {
    const chunks: string[][] = [];
    const BATCH = 90;
    for (let i = 0; i < tokens.length; i += BATCH) chunks.push(tokens.slice(i, i + BATCH));
    let sent = 0;
    for (const c of chunks) {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c.map((to: string) => ({ to, sound: 'default', title: msg.title, body: msg.body, data: msg.data || {} }))),
      });
      if (!res.ok) throw new Error('Expo push HTTP ' + res.status);
      sent += c.length;
    }
    return sent;
  }

  private async sendFcm(tokens: string[], msg: PushMessage): Promise<number> {
    if (!this.fcmKey) throw new Error('FCM_SERVER_KEY missing');
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'key=' + this.fcmKey },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: { title: msg.title, body: msg.body, sound: 'default' },
        data: msg.data || {},
        priority: 'high',
      }),
    });
    if (!res.ok) throw new Error('FCM HTTP ' + res.status);
    return tokens.length;
  }
}

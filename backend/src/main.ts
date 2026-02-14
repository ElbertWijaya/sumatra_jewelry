import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// compression has mixed default export depending on transpile, normalize:
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compressionLib = require('compression');
import helmet from 'helmet';

import { AppModule } from './modules/app.module';
import { RealtimeService } from './realtime/realtime.service';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  const compressionMw = (compressionLib.default || compressionLib)();
  app.use(compressionMw);
  app.setGlobalPrefix('api');
  // NOTE: Removed previous raw capture that consumed stream; will rely on parser then log.
  // Explicit JSON body parser (in case default was bypassed)
  try {
    const express = require('express');
    app.use(express.json({ limit: '2mb', type: ['application/json','application/*+json'] }));
    app.use(express.text({ type: 'text/plain', limit: '2mb' }));
    // Convert text/plain JSON for orders and assign-bulk tasks (including PATCH for orders)
    app.use((req: any, _res: any, next: any) => {
      const needsParse = (
        (req.method === 'POST' && (req.url.startsWith('/api/orders') || req.url.startsWith('/api/tasks/assign-bulk'))) ||
        (req.method === 'PATCH' && req.url.startsWith('/api/orders/'))
      );
      if (needsParse && typeof req.body === 'string') {
        const raw = req.body.trim();
        if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
          try {
            req.body = JSON.parse(raw);
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.log('[TEXT->JSON] Converted text/plain body. Keys:', Object.keys(req.body));
            }
          } catch (e) {
            console.warn('[TEXT->JSON] parse failed:', (e as any)?.message);
          }
        }
      }
      next();
    });
  } catch (e) {
    console.warn('express.json load failed (will rely on Nest default):', (e as any)?.message);
  }
  // Debug middlewares for request payloads (disabled in production to avoid logging PII)
  if (process.env.NODE_ENV !== 'production') {
    app.use((req: any, _res: any, next: any) => {
      if (req.method === 'POST' && req.url.startsWith('/api/orders')) {
        // eslint-disable-next-line no-console
        console.log('[PRE-VALIDATION] URL:', req.url, 'Body type:', typeof req.body, 'Keys:', req.body && Object.keys(req.body || {}));
        try {
          if (req.body && typeof req.body === 'object') {
            const { customerName, jenisBarang, jenisEmas, warnaEmas } = req.body as any;
            // eslint-disable-next-line no-console
            console.log('[PRE-VALIDATION] preview:', { customerName, jenisBarang, jenisEmas, warnaEmas });
            console.log('[PRE-VALIDATION] types:', {
              customerName: typeof customerName,
              jenisBarang: typeof jenisBarang,
              jenisEmas: typeof jenisEmas,
              warnaEmas: typeof warnaEmas,
            });
            try {
              const snapshot = JSON.stringify(req.body).slice(0, 500);
              console.log('[PRE-VALIDATION] raw json (truncated 500):', snapshot);
            } catch {}
          }
        } catch {}
      }
      next();
    });
    app.use((req: any, _res: any, next: any) => {
      if (req.method === 'POST' && req.url.startsWith('/api/tasks/assign-bulk')) {
        try {
          const b = req.body;
          console.log('[ASSIGN-BULK] body keys:', b && Object.keys(b || {}));
          console.log('[ASSIGN-BULK] typeofs:', {
            orderId: typeof b?.orderId,
            role: typeof b?.role,
            userId: typeof b?.userId,
            subtasks: Array.isArray(b?.subtasks) ? 'array' : typeof b?.subtasks,
          });
          try { console.log('[ASSIGN-BULK] body json (trunc 300):', JSON.stringify(b).slice(0,300)); } catch {}
        } catch {}
      }
      next();
    });
  }
  // Ensure uploads dir exists & serve static
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir);
  // Using express static (Nest platform-express)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const express = require('express');
  app.use('/uploads', express.static(uploadsDir));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
	// CORS: allow all origins for token-based auth, without credentials/cookies
	app.enableCors({ origin: '*' });
  // Init WebSocket realtime server on /ws
  try {
    const rt = app.get(RealtimeService);
    rt.init(app as any);
    console.log('[Realtime] WebSocket initialized at /ws');
  } catch (e) {
    console.warn('[Realtime] init failed:', (e as any)?.message);
  }
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`API running on http://0.0.0.0:${port} (LAN access: http://<IP_LAN>:${port}/api )`);
}

bootstrap();

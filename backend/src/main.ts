import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// compression has mixed default export depending on transpile, normalize:
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compressionLib = require('compression');
import helmet from 'helmet';

import { AppModule } from './modules/app.module';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  const compressionMw = (compressionLib.default || compressionLib)();
  app.use(compressionMw);
  app.setGlobalPrefix('api');
  // Debug middleware: log raw body for order create before validation
  app.use((req: any, _res: any, next: any) => {
    if (req.method === 'POST' && req.url.startsWith('/api/orders')) {
      // eslint-disable-next-line no-console
      console.log('[PRE-VALIDATION] URL:', req.url, 'Body type:', typeof req.body, 'Keys:', req.body && Object.keys(req.body || {}));
      // For safety, only shallow preview
      try {
        if (req.body && typeof req.body === 'object') {
          const { customerName, jenisBarang, jenisEmas, warnaEmas } = req.body as any;
          // eslint-disable-next-line no-console
          console.log('[PRE-VALIDATION] preview:', { customerName, jenisBarang, jenisEmas, warnaEmas });
        }
      } catch {}
    }
    next();
  });
  // Ensure uploads dir exists & serve static
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir);
  // Using express static (Nest platform-express)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const express = require('express');
  app.use('/uploads', express.static(uploadsDir));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors({ origin: '*', credentials: true });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();

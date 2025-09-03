import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// compression has mixed default export depending on transpile, normalize:
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compressionLib = require('compression');
import helmet from 'helmet';

import { AppModule } from './modules/app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  const compressionMw = (compressionLib.default || compressionLib)();
  app.use(compressionMw);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors({ origin: '*', credentials: true });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();

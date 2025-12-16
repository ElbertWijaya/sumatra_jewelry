import { Module } from '@nestjs/common';
import { PushService } from '../services/push.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PushController } from '../routes/push.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [PushService],
  controllers: [PushController],
  exports: [PushService],
})
export class PushModule {}

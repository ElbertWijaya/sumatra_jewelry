import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';

import { AuthModule } from './auth.module';
import { OrdersModule } from './orders.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

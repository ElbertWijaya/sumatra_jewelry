import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';

import { AuthModule } from './auth.module';
import { OrdersModule } from './orders.module';
import { FilesModule } from './files.module';
import { TasksModule } from './tasks.module';
import { UsersModule } from './users.module';
import { InventoryModule } from './inventory.module';
import { DashboardModule } from './dashboard.module';
import { RealtimeModule } from './realtime.module';
import { HealthController } from '../health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, OrdersModule, FilesModule, TasksModule, UsersModule, InventoryModule, DashboardModule, RealtimeModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}

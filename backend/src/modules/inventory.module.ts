import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from './realtime.module';
import { InventoryService } from '../services/inventory.service';
import { InventoryController } from '../routes/inventory.controller';

@Module({
  imports: [PrismaModule, RealtimeModule],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}

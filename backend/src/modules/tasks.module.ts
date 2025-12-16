import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksService } from '../services/tasks.service';
import { TasksController } from '../routes/tasks.controller';
import { PushModule } from './push.module';

@Module({
  imports: [PrismaModule, PushModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}

import { Module } from '@nestjs/common';
import { TasksController } from '../routes/tasks.controller';
import { TasksService } from '../services/tasks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

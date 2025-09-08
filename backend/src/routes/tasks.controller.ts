import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { TasksService } from '../services/tasks.service';
import { AssignTaskDto, CreateTaskDto, UpdateTaskDto, RequestDoneDto, ValidateTaskDto } from '../types/task.dtos';
import { CurrentUser } from '../security/current-user.decorator';
import { RequestUser } from '../types/order.dtos';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  @Roles('admin','kasir','owner','pengrajin')
  list() { return this.tasks.listActive(); }

  @Post()
  @Roles('admin','kasir','owner')
  create(@Body() dto: CreateTaskDto) { return this.tasks.create(dto); }

  @Patch(':id')
  @Roles('admin','kasir','owner')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) { return this.tasks.update(id, dto); }

  @Delete(':id')
  @Roles('admin','kasir','owner')
  remove(@Param('id', ParseIntPipe) id: number) { return this.tasks.remove(id); }

  @Post(':id/assign')
  @Roles('admin','kasir','owner')
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignTaskDto) { return this.tasks.assign(id, dto.assignedToId); }

  @Post(':id/request-done')
  @Roles('admin','kasir','owner','pengrajin')
  requestDone(@Param('id', ParseIntPipe) id: number, @Body() dto: RequestDoneDto) { return this.tasks.requestDone(id, dto.notes); }

  @Post(':id/validate')
  @Roles('admin','owner')
  validate(@Param('id', ParseIntPipe) id: number, @Body() dto: ValidateTaskDto, @CurrentUser() user: RequestUser) {
    return this.tasks.validateDone(id, user.userId, dto.notes);
  }
}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';
import { TasksService } from '../services/tasks.service';
import { AssignTaskDto, CreateTaskDto, ReviewTaskDto, SubmitTaskDto } from '../types/task.dtos';
import { CurrentUser } from '../security/current-user.decorator';

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

  @Put(':id/assign')
  @Roles('admin','kasir','owner')
  assign(@Param('id', ParseIntPipe) id: number, @Body() body: AssignTaskDto) { return this.tasks.assign(id, body); }

  @Put(':id/submit')
  @Roles('admin','kasir','owner','pengrajin')
  submit(@Param('id', ParseIntPipe) id: number, @Body() body: SubmitTaskDto, @CurrentUser() user: any) { return this.tasks.submit(id, user.userId, body); }

  @Put(':id/review')
  @Roles('admin','kasir','owner')
  review(@Param('id', ParseIntPipe) id: number, @Body() body: ReviewTaskDto, @CurrentUser() user: any) { return this.tasks.review(id, user.userId, body); }

  @Delete(':id')
  @Roles('admin','kasir','owner')
  remove(@Param('id', ParseIntPipe) id: number) { return this.tasks.remove(id); }
}

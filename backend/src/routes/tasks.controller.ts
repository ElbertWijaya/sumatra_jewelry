import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { TasksService } from '../services/tasks.service';
import { AssignTaskDto, CreateTaskDto, UpdateTaskDto, RequestDoneDto, ValidateTaskDto, AssignBulkDto } from '../types/task.dtos';
import { CurrentUser } from '../security/current-user.decorator';
import { RequestUser } from '../types/order.dtos';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  list() { return this.tasks.listActive(); }

  @Post()
  @Roles('ADMINISTRATOR','SALES')
  create(@Body() dto: CreateTaskDto) { return this.tasks.create(dto); }

  @Patch(':id')
  @Roles('ADMINISTRATOR','SALES')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) { return this.tasks.update(id, dto); }

  @Delete(':id')
  @Roles('ADMINISTRATOR','SALES')
  remove(@Param('id', ParseIntPipe) id: number) { return this.tasks.remove(id); }

  @Post(':id/assign')
  @Roles('ADMINISTRATOR','SALES')
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignTaskDto, @CurrentUser() user: RequestUser) {
    return this.tasks.assign(id, dto.assignedToId, user.userId);
  }

  @Post('assign-bulk')
  @Roles('ADMINISTRATOR','SALES')
  assignBulk(@Body() dto: AssignBulkDto, @CurrentUser() user: RequestUser) {
    return this.tasks.assignBulk({ orderId: dto.orderId, role: dto.role as any, userId: dto.userId, subtasks: dto.subtasks, actorUserId: user.userId });
  }

  @Post(':id/request-done')
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  requestDone(@Param('id', ParseIntPipe) id: number, @Body() dto: RequestDoneDto, @CurrentUser() user: RequestUser) {
    return this.tasks.requestDone(id, user.userId, dto.notes);
  }

  // Order-level atomic request-done for assignee's tasks
  @Post('order/:orderId/request-done-mine')
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  requestDoneMine(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: RequestUser,
    @Body() dto: RequestDoneDto,
  ) {
    return this.tasks.requestDoneForOrderForUser(orderId, user.userId, dto?.notes);
  }

  // Order-level accept for assignee's tasks: move ASSIGNED -> IN_PROGRESS explicitly
  @Post('order/:orderId/accept-mine')
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  acceptMine(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasks.acceptOrderForUser(orderId, user.userId);
  }

  @Post(':id/start')
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  start(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.tasks.start(id, user.userId);
  }

  @Post(':id/validate')
  @Roles('ADMINISTRATOR','SALES')
  validate(@Param('id', ParseIntPipe) id: number, @Body() dto: ValidateTaskDto, @CurrentUser() user: RequestUser) {
    return this.tasks.validateDone(id, user.userId, dto.notes);
  }

  // Bulk validate: validate all AWAITING_VALIDATION tasks for a specific user on an order
  @Post('order/:orderId/validate-user/:userId')
  @Roles('ADMINISTRATOR','SALES')
  validateUserForOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('userId') userId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ValidateTaskDto,
  ) {
    return this.tasks.validateAllForOrderAndUser(orderId, userId, user.userId, dto?.notes);
  }

  @Post(':id/check')
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  check(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.tasks.setChecked(id, user.userId, true);
  }

  @Post(':id/uncheck')
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  uncheck(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.tasks.setChecked(id, user.userId, false);
  }

  @Get('awaiting-validation')
  @Roles('ADMINISTRATOR','SALES')
  awaitingValidation(@Query('orderId', ParseIntPipe) orderId: number) {
    return this.tasks.listAwaitingValidationByOrder(orderId);
  }

  @Post('backfill')
  @Roles('ADMINISTRATOR')
  backfill() { return this.tasks.backfillActive(); }
}

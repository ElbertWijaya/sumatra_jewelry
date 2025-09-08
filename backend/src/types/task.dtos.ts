import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum TaskStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_VALIDATION = 'AWAITING_VALIDATION',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export class CreateTaskDto {
  @IsInt() orderId!: number;
  @IsOptional() @IsString() stage?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() stage?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsString() assignedToId?: string | null;
}

export class AssignTaskDto {
  @IsString() @IsNotEmpty() assignedToId!: string;
}

export class RequestDoneDto {
  @IsOptional() @IsString() notes?: string;
}

export class ValidateTaskDto {
  @IsOptional() @IsString() notes?: string;
}

export class SubTaskInputDto {
  @IsOptional() @IsString() stage?: string;
  @IsOptional() @IsString() notes?: string;
}

export class AssignBulkDto {
  @IsInt() orderId!: number;
  @IsString() @IsNotEmpty() role!: 'DESIGNER'|'CASTER'|'CARVER'|'DIAMOND_SETTER'|'FINISHER'|'INVENTORY';
  @IsString() @IsNotEmpty() userId!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SubTaskInputDto)
  subtasks!: SubTaskInputDto[];
}

import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
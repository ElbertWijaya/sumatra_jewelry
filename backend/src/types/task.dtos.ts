import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum TaskStatusEnum {
  OPEN='OPEN', ASSIGNED='ASSIGNED', IN_PROGRESS='IN_PROGRESS', IN_REVIEW='IN_REVIEW', APPROVED='APPROVED', REJECTED='REJECTED', DONE='DONE'
}

export class CreateTaskDto {
  orderId!: number;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() stage?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}

export class AssignTaskDto {
  @IsString() @IsNotEmpty() userId!: string;
}

export class SubmitTaskDto {
  @IsOptional() @IsString() note?: string;
}

export class ReviewTaskDto {
  @IsEnum(TaskStatusEnum) decision!: TaskStatusEnum; // APPROVED or REJECTED
  @IsOptional() @IsString() note?: string;
}

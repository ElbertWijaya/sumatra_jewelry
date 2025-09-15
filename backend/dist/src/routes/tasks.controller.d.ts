import { TasksService } from '../services/tasks.service';
import { AssignTaskDto, CreateTaskDto, UpdateTaskDto, RequestDoneDto, ValidateTaskDto, AssignBulkDto } from '../types/task.dtos';
import { RequestUser } from '../types/order.dtos';
export declare class TasksController {
    private tasks;
    constructor(tasks: TasksService);
    list(): Promise<any>;
    create(dto: CreateTaskDto): Promise<any>;
    update(id: number, dto: UpdateTaskDto): Promise<any>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    assign(id: number, dto: AssignTaskDto, user: RequestUser): Promise<any>;
    assignBulk(dto: AssignBulkDto, user: RequestUser): Promise<{
        created: number;
    }>;
    requestDone(id: number, dto: RequestDoneDto, user: RequestUser): Promise<any>;
    requestDoneMine(orderId: number, user: RequestUser, dto: RequestDoneDto): Promise<{
        updated: number;
    }>;
    start(id: number, user: RequestUser): Promise<any>;
    validate(id: number, dto: ValidateTaskDto, user: RequestUser): Promise<any>;
    check(id: number, user: RequestUser): Promise<any>;
    uncheck(id: number, user: RequestUser): Promise<any>;
    awaitingValidation(orderId: number): Promise<any>;
    backfill(): Promise<{
        created: number;
    }>;
}

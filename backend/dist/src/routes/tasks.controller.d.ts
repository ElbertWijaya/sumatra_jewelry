import { TasksService } from '../services/tasks.service';
import { AssignTaskDto, CreateTaskDto, UpdateTaskDto, RequestDoneDto, ValidateTaskDto } from '../types/task.dtos';
import { RequestUser } from '../types/order.dtos';
export declare class TasksController {
    private tasks;
    constructor(tasks: TasksService);
    list(): any;
    create(dto: CreateTaskDto): Promise<any>;
    update(id: number, dto: UpdateTaskDto): Promise<any>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    assign(id: number, dto: AssignTaskDto): Promise<any>;
    requestDone(id: number, dto: RequestDoneDto): Promise<any>;
    validate(id: number, dto: ValidateTaskDto, user: RequestUser): Promise<any>;
}

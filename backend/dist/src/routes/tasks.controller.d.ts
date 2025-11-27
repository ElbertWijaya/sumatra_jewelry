import { TasksService } from '../services/tasks.service';
import { AssignTaskDto, CreateTaskDto, UpdateTaskDto, RequestDoneDto, ValidateTaskDto, AssignBulkDto } from '../types/task.dtos';
import { RequestUser } from '../types/order.dtos';
export declare class TasksController {
    private tasks;
    constructor(tasks: TasksService);
    list(): unknown;
    create(dto: CreateTaskDto): unknown;
    update(id: number, dto: UpdateTaskDto): unknown;
    remove(id: number): unknown;
    assign(id: number, dto: AssignTaskDto, user: RequestUser): unknown;
    assignBulk(dto: AssignBulkDto, user: RequestUser): unknown;
    requestDone(id: number, dto: RequestDoneDto, user: RequestUser): unknown;
    requestDoneMine(orderId: number, user: RequestUser, dto: RequestDoneDto): unknown;
    acceptMine(orderId: number, user: RequestUser): unknown;
    start(id: number, user: RequestUser): unknown;
    validate(id: number, dto: ValidateTaskDto, user: RequestUser): unknown;
    validateUserForOrder(orderId: number, userId: string, user: RequestUser, dto: ValidateTaskDto): unknown;
    check(id: number, user: RequestUser): unknown;
    uncheck(id: number, user: RequestUser): unknown;
    awaitingValidation(orderId: number): unknown;
    listByOrder(orderId: number): unknown;
    backfill(): unknown;
}

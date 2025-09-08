export declare enum TaskStatus {
    OPEN = "OPEN",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    AWAITING_VALIDATION = "AWAITING_VALIDATION",
    DONE = "DONE",
    CANCELLED = "CANCELLED"
}
export declare class CreateTaskDto {
    orderId: number;
    stage?: string;
    notes?: string;
}
export declare class UpdateTaskDto {
    stage?: string;
    notes?: string;
    status?: TaskStatus;
    assignedToId?: string | null;
}
export declare class AssignTaskDto {
    assignedToId: string;
}
export declare class RequestDoneDto {
    notes?: string;
}
export declare class ValidateTaskDto {
    notes?: string;
}
export declare class SubTaskInputDto {
    stage?: string;
    notes?: string;
}
export declare class AssignBulkDto {
    orderId: number;
    role: 'pengrajin' | 'kasir' | 'owner' | 'admin';
    userId: string;
    subtasks: SubTaskInputDto[];
}

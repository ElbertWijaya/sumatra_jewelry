export declare enum TaskStatusEnum {
    OPEN = "OPEN",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    DONE = "DONE"
}
export declare class CreateTaskDto {
    orderId: number;
    title?: string;
    description?: string;
    stage?: string;
    dueDate?: string;
}
export declare class AssignTaskDto {
    userId: string;
}
export declare class SubmitTaskDto {
    note?: string;
}
export declare class ReviewTaskDto {
    decision: TaskStatusEnum;
    note?: string;
}

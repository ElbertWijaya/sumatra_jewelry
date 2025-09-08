import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '../types/task.dtos';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    private isOrderActive;
    backfillActive(): Promise<{
        created: number;
    }>;
    listActive(): any;
    create(data: {
        orderId: number;
        stage?: string;
        notes?: string;
    }): Promise<any>;
    update(id: number, patch: {
        stage?: string;
        notes?: string;
        status?: TaskStatus;
        assignedToId?: string | null;
    }): Promise<any>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    assign(id: number, assignedToId: string): Promise<any>;
    requestDone(id: number, notes?: string): Promise<any>;
    validateDone(id: number, validatorUserId: string, notes?: string): Promise<any>;
}

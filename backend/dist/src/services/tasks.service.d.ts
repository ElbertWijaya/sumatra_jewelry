import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '../types/task.dtos';
export declare class TasksService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private isOrderActive;
    private mapTask;
    backfillActive(): unknown;
    listActive(): unknown;
    listByOrder(orderId: number): unknown;
    listAwaitingValidationByOrder(orderId: number): unknown;
    create(data: {
        orderId: number;
        stage?: string;
        notes?: string;
    }): unknown;
    update(id: number, patch: {
        stage?: string;
        notes?: string;
        status?: TaskStatus;
        assignedToId?: string | null;
    }): unknown;
    remove(id: number): unknown;
    assign(id: number, assignedToId: string, actorUserId?: string): unknown;
    assignBulk(params: {
        orderId: number;
        role: 'DESIGNER' | 'CASTER' | 'CARVER' | 'DIAMOND_SETTER' | 'FINISHER' | 'INVENTORY';
        userId: string;
        subtasks: {
            stage?: string;
            notes?: string;
        }[];
        actorUserId?: string;
    }): unknown;
    requestDone(id: number, requesterUserId: string, notes?: string): unknown;
    validateDone(id: number, validatorUserId: string, notes?: string): unknown;
    validateAllForOrderAndUser(orderId: number, targetUserId: string, validatorUserId: string, notes?: string): unknown;
    requestDoneForOrderForUser(orderId: number, requesterUserId: string, notes?: string): unknown;
    setChecked(id: number, actorUserId: string, value: boolean): unknown;
    start(id: number, actorUserId: string): unknown;
    acceptOrderForUser(orderId: number, actorUserId: string): unknown;
}

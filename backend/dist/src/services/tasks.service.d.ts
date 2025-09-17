import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TaskStatus } from '../types/task.dtos';
export declare class TasksService {
    private prisma;
    private rt;
    private readonly logger;
    constructor(prisma: PrismaService, rt: RealtimeGateway);
    private isOrderActive;
    backfillActive(): Promise<{
        created: number;
    }>;
    listActive(): Promise<any>;
    listAwaitingValidationByOrder(orderId: number): Promise<any>;
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
    assign(id: number, assignedToId: string, actorUserId?: string): Promise<any>;
    assignBulk(params: {
        orderId: number;
        role: 'DESIGNER' | 'CASTER' | 'CARVER' | 'DIAMOND_SETTER' | 'FINISHER' | 'INVENTORY';
        userId: string;
        subtasks: {
            stage?: string;
            notes?: string;
        }[];
        actorUserId?: string;
    }): Promise<{
        created: number;
    }>;
    requestDone(id: number, requesterUserId: string, notes?: string): Promise<any>;
    validateDone(id: number, validatorUserId: string, notes?: string): Promise<any>;
    validateAllForOrderAndUser(orderId: number, targetUserId: string, validatorUserId: string, notes?: string): Promise<{
        updated: number;
    }>;
    requestDoneForOrderForUser(orderId: number, requesterUserId: string, notes?: string): Promise<{
        updated: number;
    }>;
    setChecked(id: number, actorUserId: string, value: boolean): Promise<any>;
    start(id: number, actorUserId: string): Promise<any>;
    acceptOrderForUser(orderId: number, actorUserId: string): Promise<{
        accepted: number;
    }>;
}

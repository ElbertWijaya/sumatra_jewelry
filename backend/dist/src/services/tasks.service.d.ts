import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '../types/task.dtos';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    listActive(): import(".prisma/client").Prisma.PrismaPromise<({
        order: {
            id: number;
            createdAt: Date;
            customerName: string;
            jenisBarang: string;
            jenisEmas: string;
            warnaEmas: string;
            updatedAt: Date;
            code: string | null;
            customerAddress: string | null;
            customerPhone: string | null;
            hargaEmasPerGram: import("@prisma/client/runtime/library").Decimal | null;
            hargaPerkiraan: import("@prisma/client/runtime/library").Decimal | null;
            hargaAkhir: import("@prisma/client/runtime/library").Decimal | null;
            dp: import("@prisma/client/runtime/library").Decimal | null;
            promisedReadyDate: Date | null;
            tanggalSelesai: Date | null;
            tanggalAmbil: Date | null;
            catatan: string | null;
            fotoDesainUrl: string | null;
            referensiGambarUrls: import("@prisma/client/runtime/library").JsonValue | null;
            stoneCount: number;
            totalBerat: import("@prisma/client/runtime/library").Decimal | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdById: string | null;
            updatedById: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            password: string;
            createdAt: Date;
        } | null;
        validatedBy: {
            id: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            password: string;
            createdAt: Date;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        orderId: number;
        stage: string | null;
        assignedToId: string | null;
        requestedDoneAt: Date | null;
        validatedById: string | null;
        validatedAt: Date | null;
        notes: string | null;
    })[]>;
    create(data: {
        orderId: number;
        stage?: string;
        notes?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        orderId: number;
        stage: string | null;
        assignedToId: string | null;
        requestedDoneAt: Date | null;
        validatedById: string | null;
        validatedAt: Date | null;
        notes: string | null;
    }>;
    update(id: number, patch: {
        stage?: string;
        notes?: string;
        status?: TaskStatus;
        assignedToId?: string | null;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        orderId: number;
        stage: string | null;
        assignedToId: string | null;
        requestedDoneAt: Date | null;
        validatedById: string | null;
        validatedAt: Date | null;
        notes: string | null;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    assign(id: number, assignedToId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        orderId: number;
        stage: string | null;
        assignedToId: string | null;
        requestedDoneAt: Date | null;
        validatedById: string | null;
        validatedAt: Date | null;
        notes: string | null;
    }>;
    requestDone(id: number, notes?: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        orderId: number;
        stage: string | null;
        assignedToId: string | null;
        requestedDoneAt: Date | null;
        validatedById: string | null;
        validatedAt: Date | null;
        notes: string | null;
    }>;
    validateDone(id: number, validatorUserId: string, notes?: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        orderId: number;
        stage: string | null;
        assignedToId: string | null;
        requestedDoneAt: Date | null;
        validatedById: string | null;
        validatedAt: Date | null;
        notes: string | null;
    }>;
}

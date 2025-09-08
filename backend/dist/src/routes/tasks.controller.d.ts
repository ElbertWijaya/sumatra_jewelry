import { TasksService } from '../services/tasks.service';
import { AssignTaskDto, CreateTaskDto, UpdateTaskDto, RequestDoneDto, ValidateTaskDto } from '../types/task.dtos';
import { RequestUser } from '../types/order.dtos';
export declare class TasksController {
    private tasks;
    constructor(tasks: TasksService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(dto: CreateTaskDto): Promise<{
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
    update(id: number, dto: UpdateTaskDto): Promise<{
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
    assign(id: number, dto: AssignTaskDto): Promise<{
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
    requestDone(id: number, dto: RequestDoneDto): Promise<{
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
    validate(id: number, dto: ValidateTaskDto, user: RequestUser): Promise<{
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

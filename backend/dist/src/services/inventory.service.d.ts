import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';
export declare class InventoryService {
    private prisma;
    private realtime;
    constructor(prisma: PrismaService, realtime: RealtimeService);
    create(dto: CreateInventoryDto, actorUserId?: string): unknown;
    update(id: number, dto: UpdateInventoryDto, actorUserId?: string): unknown;
    get(id: number): any;
    listByOrder(orderId: number): any;
    search(params: {
        q?: string;
        category?: string;
        status?: string;
        branchLocation?: string;
        placement?: string;
        statusEnum?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
    }): unknown;
    listRequestsForInventory(userId?: string): unknown;
    softDelete(id: number, actorUserId?: string): unknown;
    restore(id: number, actorUserId?: string): unknown;
}

import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';
export declare class InventoryService {
    private prisma;
    private realtime;
    constructor(prisma: PrismaService, realtime: RealtimeService);
    create(dto: CreateInventoryDto, actorUserId?: string): Promise<any>;
    update(id: number, dto: UpdateInventoryDto, actorUserId?: string): Promise<any>;
    get(id: number): any;
    listByOrder(orderId: number): any;
    search(params: {
        q?: string;
        category?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: any;
        total: any;
        take: number;
        skip: number;
    }>;
    listRequestsForInventory(userId?: string): Promise<any[]>;
}

import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateInventoryDto, actorUserId?: string): Promise<any>;
    update(id: number, dto: UpdateInventoryDto, actorUserId?: string): Promise<any>;
    get(id: number): any;
    listByOrder(orderId: number): any;
}

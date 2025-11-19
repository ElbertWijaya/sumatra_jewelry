import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';
import { RequestUser } from '../types/order.dtos';
export declare class InventoryController {
    private inv;
    constructor(inv: InventoryService);
    get(id: number): any;
    listByOrder(orderId: number): any;
    search(q?: string, category?: string, status?: string, dateFrom?: string, dateTo?: string, limit?: string, offset?: string): Promise<{
        items: any;
        total: any;
        take: number;
        skip: number;
    }>;
    requests(user: RequestUser): Promise<any[]>;
    create(dto: CreateInventoryDto, user: RequestUser): Promise<any>;
    update(id: number, dto: UpdateInventoryDto, user: RequestUser): Promise<any>;
    history(id: number): any;
}

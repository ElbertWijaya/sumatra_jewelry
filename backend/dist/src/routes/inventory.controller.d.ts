import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';
import { RequestUser } from '../types/order.dtos';
export declare class InventoryController {
    private inv;
    constructor(inv: InventoryService);
    get(id: number): any;
    listByOrder(orderId: number): any;
    search(q?: string, category?: string, status?: string, branchLocation?: string, placement?: string, statusEnum?: string, dateFrom?: string, dateTo?: string, limit?: string, offset?: string): unknown;
    requests(user: RequestUser): unknown;
    create(dto: CreateInventoryDto, user: RequestUser): unknown;
    update(id: number, dto: UpdateInventoryDto, user: RequestUser): unknown;
    history(id: number): any;
    remove(id: number, user: RequestUser): unknown;
    restore(id: number, user: RequestUser): unknown;
}

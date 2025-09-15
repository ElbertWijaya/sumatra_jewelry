import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';
import { RequestUser } from '../types/order.dtos';
export declare class InventoryController {
    private inv;
    constructor(inv: InventoryService);
    get(id: number): any;
    listByOrder(orderId: number): any;
    create(dto: CreateInventoryDto, user: RequestUser): Promise<any>;
    update(id: number, dto: UpdateInventoryDto, user: RequestUser): Promise<any>;
}

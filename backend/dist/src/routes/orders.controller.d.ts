import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, RequestUser, OrderStatusEnum, UpdateOrderDto } from '../types/order.dtos';
export declare class OrdersController {
    private orders;
    constructor(orders: OrdersService);
    create(dto: CreateOrderDto, user: RequestUser): Promise<any>;
    findAll(status?: OrderStatusEnum): Promise<any[]>;
    findOne(id: number): Promise<any>;
    history(id: number): Promise<{
        id: number;
        changedAt: Date;
        by: {
            id: any;
            fullName: any;
            jobRole: any;
        } | null;
        action: any;
        statusFrom: any;
        statusTo: any;
        summary: string | null;
        diff: any;
    }[]>;
    updateStatus(id: number, dto: UpdateOrderStatusDto, user: RequestUser): Promise<any>;
    update(id: number, dto: UpdateOrderDto, user: RequestUser): Promise<any>;
    remove(id: number, user: RequestUser): Promise<{
        success: boolean;
    }>;
}

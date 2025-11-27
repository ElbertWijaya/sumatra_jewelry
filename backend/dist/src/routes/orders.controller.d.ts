import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, RequestUser, OrderStatusEnum, UpdateOrderDto } from '../types/order.dtos';
export declare class OrdersController {
    private orders;
    constructor(orders: OrdersService);
    create(dto: CreateOrderDto, user: RequestUser): unknown;
    findAll(status?: OrderStatusEnum): unknown;
    findOne(id: number): unknown;
    history(id: number): unknown;
    updateStatus(id: number, dto: UpdateOrderStatusDto, user: RequestUser): unknown;
    update(id: number, dto: UpdateOrderDto, user: RequestUser): unknown;
    remove(id: number, user: RequestUser): unknown;
}

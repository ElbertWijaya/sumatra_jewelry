import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum, UpdateOrderDto } from '../types/order.dtos';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    private mapOrder;
    create(dto: CreateOrderDto, userId: string): unknown;
    findAll(params: {
        status?: OrderStatusEnum;
    }): unknown;
    findById(id: number): unknown;
    updateStatus(id: number, dto: UpdateOrderStatusDto, userId: string): unknown;
    history(id: number): unknown;
    update(id: number, dto: UpdateOrderDto, userId: string): unknown;
    remove(id: number, userId: string): unknown;
}

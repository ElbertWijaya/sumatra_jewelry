import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum, UpdateOrderDto } from '../types/order.dtos';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    private mapOrder;
    create(dto: CreateOrderDto, userId: string): Promise<any>;
    findAll(params: {
        status?: OrderStatusEnum;
    }): Promise<any[]>;
    findById(id: number): Promise<any>;
    updateStatus(id: number, dto: UpdateOrderStatusDto, userId: string): Promise<any>;
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
    update(id: number, dto: UpdateOrderDto, userId: string): Promise<any>;
    remove(id: number, userId: string): Promise<{
        success: boolean;
    }>;
}

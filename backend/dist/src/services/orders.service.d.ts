import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum } from '../types/order.dtos';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateOrderDto, userId: string): Promise<{
        stones: {
            orderId: number;
            id: number;
            createdAt: Date;
            bentuk: string;
            jumlah: number;
            berat: Prisma.Decimal | null;
        }[];
    } & {
        status: import(".prisma/client").$Enums.OrderStatus;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        customerName: string;
        customerAddress: string | null;
        customerPhone: string | null;
        jenisBarang: string;
        jenisEmas: string;
        warnaEmas: string;
        hargaEmasPerGram: Prisma.Decimal | null;
        hargaPerkiraan: Prisma.Decimal | null;
        hargaAkhir: Prisma.Decimal | null;
        dp: Prisma.Decimal | null;
        promisedReadyDate: Date | null;
        tanggalSelesai: Date | null;
        tanggalAmbil: Date | null;
        catatan: string | null;
        fotoDesainUrl: string | null;
        referensiGambarUrls: Prisma.JsonValue | null;
        stoneCount: number;
        totalBerat: Prisma.Decimal | null;
        createdById: string | null;
        updatedById: string | null;
    }>;
    findAll(params: {
        status?: OrderStatusEnum;
    }): Promise<({
        stones: {
            orderId: number;
            id: number;
            createdAt: Date;
            bentuk: string;
            jumlah: number;
            berat: Prisma.Decimal | null;
        }[];
    } & {
        status: import(".prisma/client").$Enums.OrderStatus;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        customerName: string;
        customerAddress: string | null;
        customerPhone: string | null;
        jenisBarang: string;
        jenisEmas: string;
        warnaEmas: string;
        hargaEmasPerGram: Prisma.Decimal | null;
        hargaPerkiraan: Prisma.Decimal | null;
        hargaAkhir: Prisma.Decimal | null;
        dp: Prisma.Decimal | null;
        promisedReadyDate: Date | null;
        tanggalSelesai: Date | null;
        tanggalAmbil: Date | null;
        catatan: string | null;
        fotoDesainUrl: string | null;
        referensiGambarUrls: Prisma.JsonValue | null;
        stoneCount: number;
        totalBerat: Prisma.Decimal | null;
        createdById: string | null;
        updatedById: string | null;
    })[]>;
    findById(id: number): Promise<{
        stones: {
            orderId: number;
            id: number;
            createdAt: Date;
            bentuk: string;
            jumlah: number;
            berat: Prisma.Decimal | null;
        }[];
    } & {
        status: import(".prisma/client").$Enums.OrderStatus;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        customerName: string;
        customerAddress: string | null;
        customerPhone: string | null;
        jenisBarang: string;
        jenisEmas: string;
        warnaEmas: string;
        hargaEmasPerGram: Prisma.Decimal | null;
        hargaPerkiraan: Prisma.Decimal | null;
        hargaAkhir: Prisma.Decimal | null;
        dp: Prisma.Decimal | null;
        promisedReadyDate: Date | null;
        tanggalSelesai: Date | null;
        tanggalAmbil: Date | null;
        catatan: string | null;
        fotoDesainUrl: string | null;
        referensiGambarUrls: Prisma.JsonValue | null;
        stoneCount: number;
        totalBerat: Prisma.Decimal | null;
        createdById: string | null;
        updatedById: string | null;
    }>;
    updateStatus(id: number, dto: UpdateOrderStatusDto, userId: string): Promise<{
        status: import(".prisma/client").$Enums.OrderStatus;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        customerName: string;
        customerAddress: string | null;
        customerPhone: string | null;
        jenisBarang: string;
        jenisEmas: string;
        warnaEmas: string;
        hargaEmasPerGram: Prisma.Decimal | null;
        hargaPerkiraan: Prisma.Decimal | null;
        hargaAkhir: Prisma.Decimal | null;
        dp: Prisma.Decimal | null;
        promisedReadyDate: Date | null;
        tanggalSelesai: Date | null;
        tanggalAmbil: Date | null;
        catatan: string | null;
        fotoDesainUrl: string | null;
        referensiGambarUrls: Prisma.JsonValue | null;
        stoneCount: number;
        totalBerat: Prisma.Decimal | null;
        createdById: string | null;
        updatedById: string | null;
    }>;
    history(id: number): Promise<{
        id: number;
        changedAt: Date;
        by: {
            id: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        summary: string | null;
        diff: Prisma.JsonValue;
    }[]>;
}

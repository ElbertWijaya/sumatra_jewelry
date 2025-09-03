import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum } from '../types/order.dtos';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateOrderDto, userId: string): Promise<{
        stones: {
            id: number;
            createdAt: Date;
            orderId: number;
            bentuk: string;
            jumlah: number;
            berat: Prisma.Decimal | null;
        }[];
    } & {
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
        beratAkhir: Prisma.Decimal | null;
        hargaEmasPerGram: Prisma.Decimal | null;
        hargaPerkiraan: Prisma.Decimal | null;
        hargaAkhir: Prisma.Decimal | null;
        dp: Prisma.Decimal;
        promisedReadyDate: Date | null;
        tanggalSelesai: Date | null;
        tanggalAmbil: Date | null;
        catatan: string | null;
        fotoDesainUrl: string | null;
        referensiGambarUrls: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdById: string | null;
        updatedById: string | null;
    }>;
    findAll(params: {
        status?: OrderStatusEnum;
    }): Promise<({
        stones: {
            id: number;
            createdAt: Date;
            orderId: number;
            bentuk: string;
            jumlah: number;
            berat: Prisma.Decimal | null;
        }[];
    } & {
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
        beratAkhir: Prisma.Decimal | null;
        hargaEmasPerGram: Prisma.Decimal | null;
        hargaPerkiraan: Prisma.Decimal | null;
        hargaAkhir: Prisma.Decimal | null;
        dp: Prisma.Decimal;
        promisedReadyDate: Date | null;
        tanggalSelesai: Date | null;
        tanggalAmbil: Date | null;
        catatan: string | null;
        fotoDesainUrl: string | null;
        referensiGambarUrls: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdById: string | null;
        updatedById: string | null;
    })[]>;
    findById(id: number): Promise<{
        stones: {
            id: number;
            createdAt: Date;
            orderId: number;
            bentuk: string;
            jumlah: number;
            berat: Prisma.Decimal | null;
        }[];
    } & {
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
        beratAkhir: Prisma.Decimal | null;
        hargaEmasPerGram: Prisma.Decimal | null;
        hargaPerkiraan: Prisma.Decimal | null;
        hargaAkhir: Prisma.Decimal | null;
        dp: Prisma.Decimal;
        promisedReadyDate: Date | null;
        tanggalSelesai: Date | null;
        tanggalAmbil: Date | null;
        catatan: string | null;
        fotoDesainUrl: string | null;
        referensiGambarUrls: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdById: string | null;
        updatedById: string | null;
    }>;
    updateStatus(id: number, dto: UpdateOrderStatusDto, userId: string): Promise<{
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
        beratAkhir: Prisma.Decimal | null;
        hargaEmasPerGram: Prisma.Decimal | null;
        hargaPerkiraan: Prisma.Decimal | null;
        hargaAkhir: Prisma.Decimal | null;
        dp: Prisma.Decimal;
        promisedReadyDate: Date | null;
        tanggalSelesai: Date | null;
        tanggalAmbil: Date | null;
        catatan: string | null;
        fotoDesainUrl: string | null;
        referensiGambarUrls: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.OrderStatus;
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

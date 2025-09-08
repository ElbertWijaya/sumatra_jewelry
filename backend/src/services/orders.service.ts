import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as dayjs from 'dayjs';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum } from '../types/order.dtos';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: string) {
    // Transaction: create order, insert stones, update summaries, set code
    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerName: dto.customerName,
          customerAddress: dto.customerAddress,
          customerPhone: dto.customerPhone,
          jenisBarang: dto.jenisBarang,
          jenisEmas: dto.jenisEmas,
          warnaEmas: dto.warnaEmas,
          hargaEmasPerGram: dto.hargaEmasPerGram,
          hargaPerkiraan: dto.hargaPerkiraan,
          hargaAkhir: dto.hargaAkhir,
          dp: dto.dp != null ? (dto.dp as any) : null,
          ...(dto.promisedReadyDate ? { promisedReadyDate: new Date(dto.promisedReadyDate) } : {}),
          tanggalSelesai: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : undefined,
          tanggalAmbil: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : undefined,
          catatan: dto.catatan,
          ...(dto.referensiGambarUrls ? { referensiGambarUrls: dto.referensiGambarUrls as unknown as Prisma.InputJsonValue } : {}),
          status: 'DRAFT',
          createdById: userId,
          updatedById: userId,
        } as any,
      });

      let stoneCount = 0;
      let totalBerat: Prisma.Decimal | null = null;
      if (dto.stones && dto.stones.length) {
        await tx.orderStone.createMany({
          data: dto.stones.map(s => ({ orderId: order.id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat }))
        });
        stoneCount = dto.stones.length;
        const sum = dto.stones.reduce((acc, s) => acc + (s.berat ? Number(s.berat) : 0), 0);
        totalBerat = new Prisma.Decimal(sum.toFixed(2));
      }

      const code = `TM-${dayjs(order.createdAt).format('YYYYMM')}-${String(order.id).padStart(4, '0')}`;
      const updated = await tx.order.update({ where: { id: order.id }, data: { code, stoneCount, totalBerat: totalBerat as any } });
      return updated;
    });

    return this.findById(created.id);
  }

  async findAll(params: { status?: OrderStatusEnum }) {
    return this.prisma.order.findMany({
      where: params.status ? { status: params.status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { stones: true },
    });
  }

  async findById(id: number) {
  const order = await this.prisma.order.findUnique({ where: { id }, include: { stones: true } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.findById(id);
    const allowed: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      DRAFT: ['DITERIMA', 'BATAL'],
      DITERIMA: ['DALAM_PROSES', 'BATAL'],
      DALAM_PROSES: ['SIAP', 'BATAL'],
      SIAP: ['DIAMBIL', 'BATAL'],
      DIAMBIL: [],
      BATAL: [],
    };
    if (!allowed[order.status].includes(dto.status)) {
      throw new BadRequestException('Transition status tidak valid');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        updatedById: userId,
      },
    });
    await this.prisma.orderHistory.create({
      data: {
        orderId: id,
        userId,
        changeSummary: `STATUS: ${order.status} -> ${dto.status}`,
        diff: { from: order.status, to: dto.status },
      },
    });
    return updated;
  }

  async history(id: number) {
    // Ensure order exists (throws if not)
    await this.findById(id);
    const records = await this.prisma.orderHistory.findMany({
      where: { orderId: id },
      include: { user: { select: { id: true, fullName: true, role: true } } },
      orderBy: { changedAt: 'asc' }
    });
    return records.map(r => ({
      id: r.id,
      changedAt: r.changedAt,
      by: r.user ? { id: r.user.id, fullName: r.user.fullName, role: r.user.role } : null,
      summary: r.changeSummary,
      diff: r.diff
    }));
  }
}

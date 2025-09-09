import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as dayjs from 'dayjs';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum, UpdateOrderDto } from '../types/order.dtos';

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

      // Auto-create an OPEN task for this new order so it appears in Tasks
      try {
        await (tx as any).orderTask.create({ data: { orderId: order.id, stage: 'Awal', status: 'OPEN' } });
      } catch (e) {
        // ignore if any race/duplicate; tasks can be created manually later
      }
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
    const records = await (this.prisma as any).orderHistory.findMany({
      where: { orderId: id },
      include: { user: { select: { id: true, fullName: true, jobRole: true } } },
      orderBy: { changedAt: 'asc' }
    });
  return records.map((r: any) => ({
      id: r.id,
      changedAt: r.changedAt,
  by: r.user ? { id: r.user.id, fullName: r.user.fullName, jobRole: (r.user as any).jobRole ?? null } : null,
      summary: r.changeSummary,
      diff: r.diff
    }));
  }

  async update(id: number, dto: UpdateOrderDto, userId: string) {
    const order = await this.findById(id);
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        customerName: dto.customerName ?? order.customerName,
        customerAddress: dto.customerAddress ?? order.customerAddress,
        customerPhone: dto.customerPhone ?? order.customerPhone,
        jenisBarang: dto.jenisBarang ?? order.jenisBarang,
        jenisEmas: dto.jenisEmas ?? order.jenisEmas,
        warnaEmas: dto.warnaEmas ?? order.warnaEmas,
        dp: (dto.dp as any) ?? order.dp,
        hargaEmasPerGram: (dto.hargaEmasPerGram as any) ?? order.hargaEmasPerGram,
        hargaPerkiraan: (dto.hargaPerkiraan as any) ?? order.hargaPerkiraan,
        hargaAkhir: (dto.hargaAkhir as any) ?? order.hargaAkhir,
        promisedReadyDate: dto.promisedReadyDate ? new Date(dto.promisedReadyDate) : order.promisedReadyDate,
        tanggalSelesai: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : order.tanggalSelesai,
        tanggalAmbil: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : order.tanggalAmbil,
        catatan: dto.catatan ?? order.catatan,
        referensiGambarUrls: (dto.referensiGambarUrls as any) ?? order.referensiGambarUrls,
        updatedById: userId,
      },
    });
    await this.prisma.orderHistory.create({
      data: {
        orderId: id,
        userId,
        changeSummary: 'EDIT ORDER',
        diff: dto as any,
      },
    });
    return updated;
  }

  async remove(id: number, userId: string) {
    // Soft delete not specified; prevent delete if not DRAFT? For now allow if not finished.
    const order = await this.findById(id);
    if (order.status === 'DIAMBIL' || order.status === 'BATAL') {
      throw new BadRequestException('Tidak dapat menghapus order history/non-aktif');
    }
    await this.prisma.orderHistory.create({
      data: {
        orderId: id,
        userId,
        changeSummary: 'DELETE ORDER',
        diff: { deleted: true },
      },
    });
    await this.prisma.order.delete({ where: { id } });
    return { success: true };
  }
}

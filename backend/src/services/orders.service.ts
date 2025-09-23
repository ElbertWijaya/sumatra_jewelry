import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
        await tx.orderTask.create({ data: { orderId: order.id, stage: 'Awal', status: 'OPEN' } });
      } catch (e) {
        // ignore if any race/duplicate; tasks can be created manually later
      }

      // History: CREATED
      try {
        const user = await this.prisma.appUser.findUnique({ where: { id: userId }, select: { fullName: true, jobRole: true } });
        await tx.orderHistory.create({
          data: ({
            orderId: order.id,
            userId,
            action: 'CREATED',
            actorName: user?.fullName ?? null,
            actorRole: (user as any)?.jobRole ?? null,
            orderCode: updated.code ?? null,
            changeSummary: 'CREATE ORDER',
          }) as any,
        });
      } catch {}
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
    const user = await this.prisma.appUser.findUnique({ where: { id: userId }, select: { fullName: true, jobRole: true } });
    await this.prisma.orderHistory.create({
      data: ({
        orderId: id,
        userId,
        action: 'STATUS_CHANGED',
        actorName: user?.fullName ?? null,
        actorRole: (user as any)?.jobRole ?? null,
        statusFrom: order.status as any,
        statusTo: dto.status as any,
        orderCode: order.code ?? null,
        changeSummary: `STATUS: ${order.status} -> ${dto.status}`,
        diff: { from: order.status, to: dto.status },
      }) as any,
    });
    return updated;
  }

  async history(id: number) {
    // Ensure order exists (throws if not)
    await this.findById(id);
    const records = await this.prisma.orderHistory.findMany({
      where: { orderId: id },
      include: { user: { select: { id: true, fullName: true, jobRole: true } } },
      orderBy: { changedAt: 'asc' }
    });
    return records.map((r) => ({
      id: r.id,
      changedAt: r.changedAt,
      by: (r as any).user ? { id: (r as any).user.id, fullName: (r as any).user.fullName, jobRole: (r as any).user.jobRole ?? null } : (r as any).actorName ? { id: (r as any).userId, fullName: (r as any).actorName, jobRole: (r as any).actorRole ?? null } : null,
      action: (r as any).action,
      statusFrom: (r as any).statusFrom ?? null,
      statusTo: (r as any).statusTo ?? null,
      summary: r.changeSummary,
      diff: r.diff,
    }));
  }

  async update(id: number, dto: UpdateOrderDto, userId: string) {
    const updatedCore = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new NotFoundException('Order tidak ditemukan');

      const data: Prisma.OrderUpdateInput = {
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
        updatedBy: userId ? ({ connect: { id: userId } } as any) : undefined,
      };
      try { console.log('[OrdersService.update] id=', id, 'patchKeys=', Object.keys(dto||{})); } catch {}
      const updated = await tx.order.update({ where: { id }, data });

      // compute prev/next patches for history
      const fields = ['customerName','customerAddress','customerPhone','jenisBarang','jenisEmas','warnaEmas','dp','hargaEmasPerGram','hargaPerkiraan','hargaAkhir','promisedReadyDate','tanggalSelesai','tanggalAmbil','catatan','referensiGambarUrls'] as const;
      const prevPatch: Record<string, unknown> = {};
      const nextPatch: Record<string, unknown> = {};
      for (const k of fields) {
        const newVal = (dto as any)[k];
        if (newVal !== undefined) {
          const oldVal = (order as any)[k];
          const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
          if (changed) {
            prevPatch[k] = oldVal ?? null;
            nextPatch[k] = newVal ?? null;
          }
        }
      }

      if (dto.stones) {
        await tx.orderStone.deleteMany({ where: { orderId: id } });
        if (dto.stones.length) {
          await tx.orderStone.createMany({ data: dto.stones.map(s => ({ orderId: id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat })) });
        }
        const stones = dto.stones;
        const stoneCount = stones.length;
        const sum = stones.reduce((acc, s) => acc + (s.berat ? Number(s.berat) : 0), 0);
        const totalBerat = new Prisma.Decimal(sum.toFixed(2));
        await tx.order.update({ where: { id }, data: { stoneCount, totalBerat: totalBerat as any } });
        nextPatch['stoneCount'] = stoneCount;
        nextPatch['totalBerat'] = totalBerat as any;
      }

      try {
        const user = await this.prisma.appUser.findUnique({ where: { id: userId }, select: { fullName: true, jobRole: true } });
        const groupId = randomUUID();
        await tx.orderHistory.create({
          data: ({
            orderId: id,
            userId,
            action: 'UPDATED',
            actorName: user?.fullName ?? null,
            actorRole: (user as any)?.jobRole ?? null,
            orderCode: updated.code ?? null,
            changeSummary: 'EDIT ORDER',
            prev: Object.keys(prevPatch).length ? (prevPatch as any) : undefined,
            next: Object.keys(nextPatch).length ? (nextPatch as any) : undefined,
            diff: dto as any,
            groupId,
          }) as any,
        });
      } catch {}
      return updated;
    });
    try { console.log('[OrdersService.update] done id=', id); } catch {}
    return this.findById(id);
  }

  async remove(id: number, userId: string) {
    // Soft delete not specified; prevent delete if not DRAFT? For now allow if not finished.
    const order = await this.findById(id);
    if (order.status === 'DIAMBIL' || order.status === 'BATAL') {
      throw new BadRequestException('Tidak dapat menghapus order history/non-aktif');
    }
  // Hapus history dulu untuk menghindari constraint error (tidak ada cascade di schema untuk OrderHistory)
    await this.prisma.orderHistory.deleteMany({ where: { orderId: id } });
  // Catatan: kita kehilangan jejak 'DELETE ORDER' karena history ikut terhapus.
  // Alternatif: pindahkan log ke tabel audit terpisah yg tidak berelasi hard.
    await this.prisma.order.delete({ where: { id } });
    return { success: true };
  }
}

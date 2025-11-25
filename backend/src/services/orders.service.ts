import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as dayjs from 'dayjs';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum, UpdateOrderDto } from '../types/order.dtos';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private mapOrder(o: any) {
    if (!o) return o;
    return {
      id: o.id,
      code: o.code ?? null,
      status: o.status ?? null,
      customerName: o.customer_name ?? null,
      customerAddress: o.customer_address ?? null,
      customerPhone: o.customer_phone ?? null,
      jenisBarang: o.item_type ?? null,
      jenisEmas: o.gold_type ?? null,
      warnaEmas: o.gold_color ?? null,
      ringSize: o.ring_size ?? null,
      dp: o.down_payment != null ? Number(o.down_payment) : null,
      hargaEmasPerGram: o.gold_price_per_gram != null ? Number(o.gold_price_per_gram) : null,
      hargaPerkiraan: o.estimated_price != null ? Number(o.estimated_price) : null,
      hargaAkhir: o.final_price != null ? Number(o.final_price) : null,
      promisedReadyDate: o.promised_ready_date ?? null,
      tanggalSelesai: o.completed_date ?? null,
      tanggalAmbil: o.pickup_date ?? null,
      catatan: o.notes ?? null,
      referensiGambarUrls: o.reference_image_urls ? (() => { try { return JSON.parse(o.reference_image_urls); } catch { return []; } })() : [],
      stoneCount: o.stone_count ?? 0,
      totalBerat: o.total_stone_weight != null ? Number(o.total_stone_weight) : null,
      totalStoneWeight: o.total_stone_weight != null ? Number(o.total_stone_weight) : null,
      createdAt: o.created_at ?? null,
      updatedAt: o.updated_at ?? null,
      createdById: o.created_by_id ?? null,
      updatedById: o.updated_by_id ?? null,
      stones: Array.isArray(o.orderstone) ? o.orderstone.map((s: any) => ({ id: s.id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat != null ? Number(s.berat) : null })) : [],
    };
  }

  async create(dto: CreateOrderDto, userId: string) {
    // Transaction: create order, insert stones, update summaries, set code
    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customer_name: dto.customerName,
          customer_address: dto.customerAddress ?? null,
          customer_phone: dto.customerPhone ?? null,
          item_type: dto.jenisBarang,
          gold_type: dto.jenisEmas,
          gold_color: dto.warnaEmas,
          ring_size: dto.ringSize ?? null,
          gold_price_per_gram: (dto.hargaEmasPerGram as any) ?? null,
          estimated_price: (dto.hargaPerkiraan as any) ?? null,
          final_price: (dto.hargaAkhir as any) ?? null,
          down_payment: (dto.dp as any) ?? null,
          promised_ready_date: dto.promisedReadyDate ? new Date(dto.promisedReadyDate) : null,
          completed_date: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : null,
          pickup_date: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : null,
          notes: dto.catatan ?? null,
          reference_image_urls: dto.referensiGambarUrls ? JSON.stringify(dto.referensiGambarUrls) : null,
          status: 'DITERIMA',
          created_by_id: userId,
          updated_by_id: userId,
          updated_at: new Date(),
        },
      });

      let stoneCount = 0;
      let totalBerat: Prisma.Decimal | null = null;
      if (dto.stones && dto.stones.length) {
        await tx.orderstone.createMany({
          data: dto.stones.map(s => ({ orderId: order.id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat as any }))
        });
        const totalJumlah = dto.stones.reduce((acc, s) => acc + (s.jumlah || 0), 0);
        stoneCount = totalJumlah;
        const sum = dto.stones.reduce((acc, s) => acc + (s.berat ? Number(s.berat) : 0), 0);
        totalBerat = new Prisma.Decimal(sum.toFixed(2));
      }

      const code = `TM-${dayjs(order.created_at).format('YYYYMM')}-${String(order.id).padStart(4, '0')}`;
      const updated = await tx.order.update({ where: { id: order.id }, data: { code, stone_count: stoneCount, total_stone_weight: totalBerat as any } });

      // Auto-create an OPEN task for this new order so it appears in Tasks
      try {
        await tx.ordertask.create({ data: { orderId: order.id, stage: 'Awal', status: 'OPEN', updated_at: new Date() } });
      } catch (e) {
        // ignore if any race/duplicate; tasks can be created manually later
      }

      // History: CREATED
      try {
  const user = await this.prisma.account.findUnique({ where: { id: userId }, select: { fullName: true, job_role: true } });
        await tx.orderhistory.create({
          data: ({
            orderId: order.id,
            userId,
            action: 'CREATED',
            actorName: user?.fullName ?? null,
            actorRole: (user as any)?.job_role ?? null,
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
    const rows = await this.prisma.order.findMany({
      where: params.status ? { status: params.status as any } : undefined,
      orderBy: { created_at: 'desc' },
      include: { orderstone: true },
    });
    return rows.map(r => this.mapOrder(r));
  }

  async findById(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { orderstone: true } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return this.mapOrder(order);
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.findById(id);
    const allowed: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      DITERIMA: ['DALAM_PROSES', 'BATAL'],
      DALAM_PROSES: ['SIAP', 'BATAL'],
      SIAP: ['DIAMBIL', 'BATAL'],
      DIAMBIL: [],
      BATAL: [],
    };
    const currentStatus = order.status as OrderStatusEnum;
    if (!allowed[currentStatus].includes(dto.status)) {
      throw new BadRequestException('Transition status tidak valid');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        updated_by_id: userId,
        updated_at: new Date(),
      },
    });
  const user = await this.prisma.account.findUnique({ where: { id: userId }, select: { fullName: true, job_role: true } });
    await this.prisma.orderhistory.create({
      data: ({
        orderId: id,
        userId,
        action: 'STATUS_CHANGED',
        actorName: user?.fullName ?? null,
        actorRole: (user as any)?.job_role ?? null,
        statusFrom: order.status as any,
        statusTo: dto.status as any,
        orderCode: order.code ?? null,
        changeSummary: `STATUS: ${order.status} -> ${dto.status}`,
        diff: JSON.stringify({ from: order.status, to: dto.status }),
      }) as any,
    });
    return this.mapOrder(updated);
  }

  async history(id: number) {
    // Ensure order exists (throws if not)
    await this.findById(id);
    const records = await this.prisma.orderhistory.findMany({
      where: { orderId: id },
  include: { account: { select: { id: true, fullName: true, job_role: true } } },
      orderBy: { changedAt: 'asc' }
    });
    return records.map((r) => ({
      id: r.id,
      changedAt: r.changedAt,
      by: (r as any).account ? { id: (r as any).account.id, fullName: (r as any).account.fullName, jobRole: (r as any).account.job_role ?? null } : (r as any).actorName ? { id: (r as any).userId, fullName: (r as any).actorName, jobRole: (r as any).actorRole ?? null } : null,
      action: (r as any).action,
      statusFrom: (r as any).statusFrom ?? null,
      statusTo: (r as any).statusTo ?? null,
      summary: r.changeSummary,
      diff: r.diff ? JSON.parse(r.diff) : null,
    }));
  }

  async update(id: number, dto: UpdateOrderDto, userId: string) {
    const updatedCore = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new NotFoundException('Order tidak ditemukan');

      const data: any = {
        customer_name: dto.customerName ?? (order as any).customer_name,
        customer_address: dto.customerAddress ?? (order as any).customer_address,
        customer_phone: dto.customerPhone ?? (order as any).customer_phone,
        item_type: dto.jenisBarang ?? (order as any).item_type,
        gold_type: dto.jenisEmas ?? (order as any).gold_type,
        gold_color: dto.warnaEmas ?? (order as any).gold_color,
        ring_size: dto.ringSize ?? (order as any).ring_size,
        down_payment: (dto.dp as any) ?? (order as any).down_payment,
        gold_price_per_gram: (dto.hargaEmasPerGram as any) ?? (order as any).gold_price_per_gram,
        estimated_price: (dto.hargaPerkiraan as any) ?? (order as any).estimated_price,
        final_price: (dto.hargaAkhir as any) ?? (order as any).final_price,
        promised_ready_date: dto.promisedReadyDate ? new Date(dto.promisedReadyDate) : (order as any).promised_ready_date,
        completed_date: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : (order as any).completed_date,
        pickup_date: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : (order as any).pickup_date,
        notes: dto.catatan ?? (order as any).notes,
        reference_image_urls: dto.referensiGambarUrls ? JSON.stringify(dto.referensiGambarUrls) : (order as any).reference_image_urls,
        updated_by_id: userId ?? (order as any).updated_by_id,
        updated_at: new Date(),
      };
      try { console.log('[OrdersService.update] id=', id, 'patchKeys=', Object.keys(dto||{})); } catch {}
      const updated = await tx.order.update({ where: { id }, data });

      // compute prev/next patches for history
  const fields = ['customerName','customerAddress','customerPhone','jenisBarang','jenisEmas','warnaEmas','ringSize','dp','hargaEmasPerGram','hargaPerkiraan','hargaAkhir','promisedReadyDate','tanggalSelesai','tanggalAmbil','catatan','referensiGambarUrls'] as const;
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
        await tx.orderstone.deleteMany({ where: { orderId: id } });
        if (dto.stones.length) {
          await tx.orderstone.createMany({ data: dto.stones.map(s => ({ orderId: id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat as any })) });
        }
        const stones = dto.stones;
        const stoneCount = stones.reduce((acc, s) => acc + (s.jumlah || 0), 0);
        const sum = stones.reduce((acc, s) => acc + (s.berat ? Number(s.berat) : 0), 0);
        const totalBerat = new Prisma.Decimal(sum.toFixed(2));
        await tx.order.update({ where: { id }, data: { stone_count: stoneCount, total_stone_weight: totalBerat as any } });
        nextPatch['stone_count'] = stoneCount;
        nextPatch['total_stone_weight'] = totalBerat as any;
      }

      try {
  const user = await this.prisma.account.findUnique({ where: { id: userId }, select: { fullName: true, job_role: true } });
        const groupId = randomUUID();
        await tx.orderhistory.create({
          data: ({
            orderId: id,
            userId,
            action: 'UPDATED',
            actorName: user?.fullName ?? null,
            actorRole: (user as any)?.job_role ?? null,
            orderCode: updated.code ?? null,
            changeSummary: 'EDIT ORDER',
            prev: Object.keys(prevPatch).length ? JSON.stringify(prevPatch) : undefined,
            next: Object.keys(nextPatch).length ? JSON.stringify(nextPatch) : undefined,
            diff: JSON.stringify(dto),
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
    await this.prisma.orderhistory.deleteMany({ where: { orderId: id } });
  // Catatan: kita kehilangan jejak 'DELETE ORDER' karena history ikut terhapus.
  // Alternatif: pindahkan log ke tabel audit terpisah yg tidak berelasi hard.
    await this.prisma.order.delete({ where: { id } });
    return { success: true };
  }
}

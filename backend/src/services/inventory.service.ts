import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService, private realtime: RealtimeService) {}

  async create(dto: CreateInventoryDto, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    // Business rule: code unik per kategori (case-insensitive) jika keduanya ada
    if (dto.code && dto.category) {
      const existsSame = await (this.prisma as any).inventoryItem.findFirst({
        where: { category: dto.category, code: { equals: dto.code, mode: 'insensitive' } },
        select: { id: true },
      });
      if (existsSame) throw new BadRequestException('Kode inventory sudah dipakai dalam kategori tersebut');
    }
    const data: any = {
      orderId: dto.orderId,
      code: dto.code ?? null,
      name: dto.name ?? null,
      category: dto.category ?? null,
      material: dto.material ?? null,
      karat: dto.karat ?? null,
      goldType: dto.goldType ?? null,
      goldColor: dto.goldColor ?? null,
      weightGross: dto.weightGross != null ? Number(dto.weightGross) : null,
      weightNet: dto.weightNet != null ? Number(dto.weightNet) : null,
      stoneCount: dto.stoneCount != null ? Number(dto.stoneCount) : null,
      stoneWeight: dto.stoneWeight != null ? Number(dto.stoneWeight) : null,
      size: dto.size ?? null,
      dimensions: dto.dimensions ?? null,
      barcode: dto.barcode ?? null,
      sku: dto.sku ?? null,
      location: dto.location ?? null,
      cost: dto.cost != null ? Number(dto.cost) : null,
      price: dto.price != null ? Number(dto.price) : null,
      status: dto.status ?? 'IN_STOCK',
      images: Array.isArray(dto.images) ? dto.images : undefined,
      notes: dto.notes ?? null,
      createdById: actorUserId ?? null,
      updatedById: actorUserId ?? null,
    };
    try {
      const created = await (this.prisma as any).inventoryItem.create({ data });
      // Audit to OrderHistory (endpoint terpisah akan membaca dari sini)
      try {
        await (this.prisma as any).orderHistory.create({
          data: {
            orderId: dto.orderId,
            userId: actorUserId ?? null,
            action: 'UPDATED',
            changeSummary: 'Inventory item created',
            field: 'inventory_item',
            next: created,
            statusFrom: order.status,
            statusTo: order.status,
          },
        });
      } catch {}
      // Otomatis minta verifikasi ke Sales: set tasks INVENTORY -> AWAITING_VALIDATION untuk user yg bersangkutan bila ada
      try {
        await (this.prisma as any).orderTask.updateMany({
          where: {
            orderId: dto.orderId,
            jobRole: 'INVENTORY',
            assignedToId: actorUserId ?? undefined,
            status: { in: ['ASSIGNED','IN_PROGRESS'] },
          },
          data: { status: 'AWAITING_VALIDATION', requestedDoneAt: new Date() },
        });
      } catch {}
      try {
        this.realtime.emitAll({ type: 'inventory.created', itemId: created.id, orderId: dto.orderId });
      } catch {}
      return created;
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Gagal membuat inventory');
    }
  }

  async update(id: number, dto: UpdateInventoryDto, actorUserId?: string) {
    const exists = await (this.prisma as any).inventoryItem.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory tidak ditemukan');
    const data: any = {
      ...dto,
      weightGross: dto.weightGross != null ? Number(dto.weightGross) : undefined,
      weightNet: dto.weightNet != null ? Number(dto.weightNet) : undefined,
      stoneCount: dto.stoneCount != null ? Number(dto.stoneCount) : undefined,
      stoneWeight: dto.stoneWeight != null ? Number(dto.stoneWeight) : undefined,
      cost: dto.cost != null ? Number(dto.cost) : undefined,
      price: dto.price != null ? Number(dto.price) : undefined,
      updatedById: actorUserId ?? undefined,
    };
    try {
      const updated = await (this.prisma as any).inventoryItem.update({ where: { id }, data });
      try {
        this.realtime.emitAll({ type: 'inventory.updated', itemId: id, orderId: (exists as any)?.orderId ?? undefined });
      } catch {}
      return updated;
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Gagal update inventory');
    }
  }

  get(id: number) {
    return (this.prisma as any).inventoryItem.findUnique({ where: { id } });
  }

  listByOrder(orderId: number) {
    return (this.prisma as any).inventoryItem.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }

  async search(params: { q?: string; category?: string; status?: string; dateFrom?: string; dateTo?: string; limit?: number; offset?: number }) {
    const where: any = {};
    if (params.category) where.category = params.category;
    if (params.status) where.status = params.status;
    if (params.q) {
      const q = params.q;
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { barcode: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) (where.createdAt as any).gte = new Date(params.dateFrom);
      if (params.dateTo) (where.createdAt as any).lte = new Date(params.dateTo);
    }
    const take = Math.min(Number(params.limit || 50), 200);
    const skip = Math.max(Number(params.offset || 0), 0);
    const [items, total] = await this.prisma.$transaction([
      (this.prisma as any).inventoryItem.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
      (this.prisma as any).inventoryItem.count({ where }),
    ]);
    return { items, total, take, skip };
  }

  async listRequestsForInventory(userId?: string) {
    // request inventory = task untuk INVENTORY yang masih ASSIGNED/IN_PROGRESS
    const tasks = await (this.prisma as any).orderTask.findMany({
      where: { jobRole: 'INVENTORY', status: { in: ['ASSIGNED','IN_PROGRESS'] }, ...(userId ? { assignedToId: userId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { order: true },
    });
    // group by orderId
    const byOrder = new Map<number, any[]>();
    for (const t of tasks) {
      const arr = byOrder.get(t.orderId) || [];
      arr.push(t);
      byOrder.set(t.orderId, arr);
    }
    const results = [] as any[];
    for (const [orderId, group] of byOrder.entries()) {
      const items = await (this.prisma as any).inventoryItem.count({ where: { orderId } });
      results.push({ orderId, order: group[0]?.order, taskCount: group.length, existingItems: items });
    }
    results.sort((a,b)=> (b.order?.updatedAt ? new Date(b.order.updatedAt).getTime() : 0) - (a.order?.updatedAt ? new Date(a.order.updatedAt).getTime() : 0));
    return results;
  }
}

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
      // Prisma versi saat ini tidak mendukung 'mode: "insensitive"' pada equals.
      // Gunakan raw query LOWER(...) untuk jamin case-insensitive, lalu fallback ke ORM strict equals.
      try {
        const dup: any[] = await (this.prisma as any).$queryRawUnsafe(
          'SELECT id FROM InventoryItem WHERE category = ? AND LOWER(code) = LOWER(?) LIMIT 1',
          dto.category,
          dto.code,
        );
        if (dup && dup.length) {
          throw new BadRequestException('Kode inventory sudah dipakai dalam kategori tersebut');
        }
      } catch (err) {
        // If raw query fails for any reason, fallback to ORM exact match
        const existsSame = await (this.prisma as any).inventoryitem.findFirst({
          where: { category: dto.category, code: dto.code },
          select: { id: true },
        });
        if (existsSame) throw new BadRequestException('Kode inventory sudah dipakai dalam kategori tersebut');
      }
    }
    const data: any = {
      orderId: dto.orderId,
      code: dto.code ?? null,
      name: dto.name ?? null,
      category: dto.category ?? null,
      gold_type: dto.goldType ?? null,
      gold_color: dto.goldColor ?? null,
      weight_gross: dto.weightGross != null ? Number(dto.weightGross) : null,
      weight_net: dto.weightNet != null ? Number(dto.weightNet) : null,
      stone_count: dto.stoneCount != null ? Number(dto.stoneCount) : null,
      stone_weight: dto.stoneWeight != null ? Number(dto.stoneWeight) : null,
      ring_size: dto.size ?? null,
      dimensions: dto.dimensions ?? null,
      barcode: dto.barcode ?? null,
      sku: dto.sku ?? null,
      cost: dto.cost != null ? Number(dto.cost) : null,
      price: dto.price != null ? Number(dto.price) : null,
      status: dto.status ?? null,
      status_enum: dto.statusEnum ?? 'DRAFT',
      images: Array.isArray(dto.images) ? JSON.stringify(dto.images) : null,
      branch_location: dto.branchLocation ?? null,
      placement_location: dto.placement ?? null,
      created_by_id: actorUserId ?? null,
      updated_by_id: actorUserId ?? null,
      updated_at: new Date(),
    };
    // Derive stoneCount & stoneWeight from stones if not explicitly provided
    if ((!data.stone_count || !data.stone_weight) && Array.isArray(dto.stones) && dto.stones.length) {
      const totalJumlah = dto.stones.reduce((s, x) => s + (x.jumlah || 0), 0);
      const totalBerat = dto.stones.reduce((s, x) => s + (x.berat != null ? Number(x.berat) : 0), 0);
      if (!data.stone_count) data.stone_count = totalJumlah;
      if (!data.stone_weight) data.stone_weight = totalBerat;
    }
    try {
      const created = await (this.prisma as any).inventoryitem.create({
        data: {
          ...data,
          inventorystone: Array.isArray(dto.stones) && dto.stones.length
            ? { create: dto.stones.map(s => ({ bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat != null ? Number(s.berat) : null })) }
            : undefined,
        },
        include: { inventorystone: true },
      });
      // Audit to OrderHistory (endpoint terpisah akan membaca dari sini)
      try {
        await (this.prisma as any).orderhistory.create({
          data: {
            orderId: dto.orderId,
            userId: actorUserId ?? null,
            action: 'UPDATED',
            changeSummary: 'Inventory item created',
            field: 'inventory_item',
            next: JSON.stringify(created),
            statusFrom: order.status,
            statusTo: order.status,
          },
        });
      } catch {}
      // Otomatis minta verifikasi ke Sales: set tasks INVENTORY -> AWAITING_VALIDATION untuk user yg bersangkutan bila ada
      try {
        await (this.prisma as any).ordertask.updateMany({
          where: {
            orderId: dto.orderId,
            job_role: 'INVENTORY',
            assigned_to_id: actorUserId ?? undefined,
            status: { in: ['ASSIGNED','IN_PROGRESS'] },
          },
          data: { status: 'AWAITING_VALIDATION', requested_done_at: new Date(), updated_at: new Date() },
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
    const exists = await (this.prisma as any).inventoryitem.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory tidak ditemukan');
    if ((exists as any).is_deleted) throw new BadRequestException('Item sudah dihapus (soft delete)');
    const data: any = {
      weight_gross: dto.weightGross != null ? Number(dto.weightGross) : undefined,
      weight_net: dto.weightNet != null ? Number(dto.weightNet) : undefined,
      stone_count: dto.stoneCount != null ? Number(dto.stoneCount) : undefined,
      stone_weight: dto.stoneWeight != null ? Number(dto.stoneWeight) : undefined,
      cost: dto.cost != null ? Number(dto.cost) : undefined,
      price: dto.price != null ? Number(dto.price) : undefined,
      updated_by_id: actorUserId ?? undefined,
      branch_location: dto.branchLocation ?? undefined,
      placement_location: dto.placement ?? undefined,
      status_enum: dto.statusEnum ?? undefined,
      updated_at: new Date(),
      code: dto.code ?? undefined,
      name: dto.name ?? undefined,
      category: dto.category ?? undefined,
      gold_type: dto.goldType ?? undefined,
      gold_color: dto.goldColor ?? undefined,
      ring_size: dto.size ?? undefined,
      dimensions: dto.dimensions ?? undefined,
      barcode: dto.barcode ?? undefined,
      sku: dto.sku ?? undefined,
      status: dto.status ?? undefined,
      images: Array.isArray(dto.images) ? JSON.stringify(dto.images) : undefined,
    };
    // If stones array provided, replace existing stones and recalc aggregates when not explicitly passed
    const stonesOps = Array.isArray(dto.stones)
      ? { deleteMany: {}, create: dto.stones.map(s => ({ bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat != null ? Number(s.berat) : null })) }
      : undefined;
    if (Array.isArray(dto.stones) && dto.stones.length) {
      if (dto.stoneCount == null) data.stone_count = dto.stones.reduce((s, x) => s + (x.jumlah || 0), 0);
      if (dto.stoneWeight == null) data.stone_weight = dto.stones.reduce((s, x) => s + (x.berat != null ? Number(x.berat) : 0), 0);
    }
    try {
      const updated = await (this.prisma as any).inventoryitem.update({
        where: { id },
        data: {
          ...data,
          ...(stonesOps ? { inventorystone: stonesOps } : {}),
        },
        include: { inventorystone: true },
      });
      // History log
      try {
        const diff = { before: exists, after: updated };
        await (this.prisma as any).inventoryitemhistory.create({
          data: {
            inventoryItemId: id,
            action: (dto.statusEnum && dto.statusEnum !== (exists as any).status_enum) ? 'STATUS_CHANGED' : 'UPDATED',
            userId: actorUserId ?? null,
            diff: JSON.stringify(diff),
            snapshot: JSON.stringify(updated),
          },
        });
      } catch {}
      try {
        this.realtime.emitAll({ type: 'inventory.updated', itemId: id, orderId: (exists as any)?.orderId ?? undefined });
      } catch {}
      return updated;
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Gagal update inventory');
    }
  }

  get(id: number) {
    return (this.prisma as any).inventoryitem.findUnique({ where: { id }, include: { inventorystone: true } });
  }

  listByOrder(orderId: number) {
    return (this.prisma as any).inventoryitem.findMany({ where: { orderId, is_deleted: false }, orderBy: { created_at: 'desc' }, include: { inventorystone: true } });
  }

  async search(params: { q?: string; category?: string; status?: string; branchLocation?: string; placement?: string; statusEnum?: string; goldType?: string; goldColor?: string; dateFrom?: string; dateTo?: string; limit?: number; offset?: number }) {
    const where: any = { is_deleted: false };
    if (params.category) where.category = params.category;
    if (params.status) where.status = params.status;
    if (params.branchLocation) where.branch_location = params.branchLocation;
    if (params.placement) where.placement_location = params.placement;
    if (params.statusEnum) where.status_enum = params.statusEnum;
    if (params.goldType) where.gold_type = params.goldType;
    if (params.goldColor) where.gold_color = params.goldColor;
    if (params.q) {
      const q = params.q;
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { barcode: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (params.dateFrom || params.dateTo) {
      where.created_at = {};
      if (params.dateFrom) (where.created_at as any).gte = new Date(params.dateFrom);
      if (params.dateTo) (where.created_at as any).lte = new Date(params.dateTo);
    }
    const take = Math.min(Number(params.limit || 50), 200);
    const skip = Math.max(Number(params.offset || 0), 0);
    const [items, total] = await this.prisma.$transaction([
      (this.prisma as any).inventoryitem.findMany({ where, orderBy: { created_at: 'desc' }, take, skip, include: { inventorystone: true } }),
      (this.prisma as any).inventoryitem.count({ where }),
    ]);
    return { items, total, take, skip };
  }

  async listRequestsForInventory(userId?: string) {
    // request inventory = task untuk INVENTORY yang masih ASSIGNED/IN_PROGRESS
    const tasks = await (this.prisma as any).ordertask.findMany({
      where: { job_role: 'INVENTORY', status: { in: ['ASSIGNED','IN_PROGRESS'] }, ...(userId ? { assigned_to_id: userId } : {}) },
      orderBy: { created_at: 'desc' },
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
      const items = await (this.prisma as any).inventoryitem.count({ where: { orderId, is_deleted: false } });
      results.push({ orderId, order: group[0]?.order, taskCount: group.length, existingItems: items });
    }
    results.sort((a,b)=> (b.order?.updated_at ? new Date(b.order.updated_at).getTime() : 0) - (a.order?.updated_at ? new Date(a.order.updated_at).getTime() : 0));
    return results;
  }

  async softDelete(id: number, actorUserId?: string) {
    const exists = await (this.prisma as any).inventoryitem.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory tidak ditemukan');
    if ((exists as any).is_deleted) return exists; // already deleted
    const deleted = await (this.prisma as any).inventoryitem.update({ where: { id }, data: { is_deleted: true, deleted_at: new Date(), updated_at: new Date() } });
    try {
      await (this.prisma as any).inventoryitemhistory.create({
        data: { inventoryItemId: id, action: 'DELETED', userId: actorUserId ?? null, snapshot: JSON.stringify(deleted) }
      });
    } catch {}
    try { this.realtime.emitAll({ type: 'inventory.updated', itemId: id, orderId: (exists as any)?.orderId }); } catch {}
    return deleted;
  }

  async restore(id: number, actorUserId?: string) {
    const exists = await (this.prisma as any).inventoryitem.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory tidak ditemukan');
    if (!(exists as any).is_deleted) return exists; // nothing to restore
    const restored = await (this.prisma as any).inventoryitem.update({ where: { id }, data: { is_deleted: false, deleted_at: null, updated_at: new Date() } });
    try {
      await (this.prisma as any).inventoryitemhistory.create({
        data: { inventoryItemId: id, action: 'RESTORED', userId: actorUserId ?? null, snapshot: JSON.stringify(restored) }
      });
    } catch {}
    try { this.realtime.emitAll({ type: 'inventory.updated', itemId: id, orderId: (exists as any)?.orderId }); } catch {}
    return restored;
  }
}

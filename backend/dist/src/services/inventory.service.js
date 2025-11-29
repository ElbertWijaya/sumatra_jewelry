"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_service_1 = require("../realtime/realtime.service");
let InventoryService = class InventoryService {
    constructor(prisma, realtime) {
        this.prisma = prisma;
        this.realtime = realtime;
    }
    async create(dto, actorUserId) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (dto.code && dto.category) {
            try {
                const dup = await this.prisma.$queryRawUnsafe('SELECT id FROM InventoryItem WHERE category = ? AND LOWER(code) = LOWER(?) LIMIT 1', dto.category, dto.code);
                if (dup && dup.length) {
                    throw new common_1.BadRequestException('Kode inventory sudah dipakai dalam kategori tersebut');
                }
            }
            catch (err) {
                const existsSame = await this.prisma.inventoryitem.findFirst({
                    where: { category: dto.category, code: dto.code },
                    select: { id: true },
                });
                if (existsSame)
                    throw new common_1.BadRequestException('Kode inventory sudah dipakai dalam kategori tersebut');
            }
        }
        const data = {
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
        if ((!data.stone_count || !data.stone_weight) && Array.isArray(dto.stones) && dto.stones.length) {
            const totalJumlah = dto.stones.reduce((s, x) => s + (x.jumlah || 0), 0);
            const totalBerat = dto.stones.reduce((s, x) => s + (x.berat != null ? Number(x.berat) : 0), 0);
            if (!data.stone_count)
                data.stone_count = totalJumlah;
            if (!data.stone_weight)
                data.stone_weight = totalBerat;
        }
        try {
            const created = await this.prisma.inventoryitem.create({
                data: {
                    ...data,
                    inventorystone: Array.isArray(dto.stones) && dto.stones.length
                        ? { create: dto.stones.map(s => ({ bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat != null ? Number(s.berat) : null })) }
                        : undefined,
                },
                include: { inventorystone: true },
            });
            try {
                await this.prisma.orderhistory.create({
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
            }
            catch { }
            try {
                await this.prisma.ordertask.updateMany({
                    where: {
                        orderId: dto.orderId,
                        job_role: 'INVENTORY',
                        assigned_to_id: actorUserId ?? undefined,
                        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
                    },
                    data: { status: 'AWAITING_VALIDATION', requested_done_at: new Date(), updated_at: new Date() },
                });
            }
            catch { }
            try {
                this.realtime.emitAll({ type: 'inventory.created', itemId: created.id, orderId: dto.orderId });
            }
            catch { }
            return created;
        }
        catch (e) {
            throw new common_1.BadRequestException(e?.message || 'Gagal membuat inventory');
        }
    }
    async update(id, dto, actorUserId) {
        const exists = await this.prisma.inventoryitem.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Inventory tidak ditemukan');
        if (exists.is_deleted)
            throw new common_1.BadRequestException('Item sudah dihapus (soft delete)');
        const data = {
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
        const stonesOps = Array.isArray(dto.stones)
            ? { deleteMany: {}, create: dto.stones.map(s => ({ bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat != null ? Number(s.berat) : null })) }
            : undefined;
        if (Array.isArray(dto.stones) && dto.stones.length) {
            if (dto.stoneCount == null)
                data.stone_count = dto.stones.reduce((s, x) => s + (x.jumlah || 0), 0);
            if (dto.stoneWeight == null)
                data.stone_weight = dto.stones.reduce((s, x) => s + (x.berat != null ? Number(x.berat) : 0), 0);
        }
        try {
            const updated = await this.prisma.inventoryitem.update({
                where: { id },
                data: {
                    ...data,
                    ...(stonesOps ? { inventorystone: stonesOps } : {}),
                },
                include: { inventorystone: true },
            });
            try {
                const diff = { before: exists, after: updated };
                await this.prisma.inventoryitemhistory.create({
                    data: {
                        inventoryItemId: id,
                        action: (dto.statusEnum && dto.statusEnum !== exists.status_enum) ? 'STATUS_CHANGED' : 'UPDATED',
                        userId: actorUserId ?? null,
                        diff: JSON.stringify(diff),
                        snapshot: JSON.stringify(updated),
                    },
                });
            }
            catch { }
            try {
                this.realtime.emitAll({ type: 'inventory.updated', itemId: id, orderId: exists?.orderId ?? undefined });
            }
            catch { }
            return updated;
        }
        catch (e) {
            throw new common_1.BadRequestException(e?.message || 'Gagal update inventory');
        }
    }
    get(id) {
        return this.prisma.inventoryitem.findUnique({ where: { id }, include: { inventorystone: true } });
    }
    listByOrder(orderId) {
        return this.prisma.inventoryitem.findMany({ where: { orderId, is_deleted: false }, orderBy: { created_at: 'desc' }, include: { inventorystone: true } });
    }
    async search(params) {
        const where = { is_deleted: false };
        if (params.category)
            where.category = params.category;
        if (params.status)
            where.status = params.status;
        if (params.branchLocation)
            where.branch_location = params.branchLocation;
        if (params.placement)
            where.placement_location = params.placement;
        if (params.statusEnum)
            where.status_enum = params.statusEnum;
        if (params.goldType)
            where.gold_type = params.goldType;
        if (params.goldColor)
            where.gold_color = params.goldColor;
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
            if (params.dateFrom)
                where.created_at.gte = new Date(params.dateFrom);
            if (params.dateTo)
                where.created_at.lte = new Date(params.dateTo);
        }
        const take = Math.min(Number(params.limit || 50), 200);
        const skip = Math.max(Number(params.offset || 0), 0);
        const [items, total] = await this.prisma.$transaction([
            this.prisma.inventoryitem.findMany({ where, orderBy: { created_at: 'desc' }, take, skip, include: { inventorystone: true } }),
            this.prisma.inventoryitem.count({ where }),
        ]);
        return { items, total, take, skip };
    }
    async listRequestsForInventory(userId) {
        const tasks = await this.prisma.ordertask.findMany({
            where: { job_role: 'INVENTORY', status: { in: ['ASSIGNED', 'IN_PROGRESS'] }, ...(userId ? { assigned_to_id: userId } : {}) },
            orderBy: { created_at: 'desc' },
            include: { order: true },
        });
        const byOrder = new Map();
        for (const t of tasks) {
            const arr = byOrder.get(t.orderId) || [];
            arr.push(t);
            byOrder.set(t.orderId, arr);
        }
        const results = [];
        for (const [orderId, group] of byOrder.entries()) {
            const items = await this.prisma.inventoryitem.count({ where: { orderId, is_deleted: false } });
            results.push({ orderId, order: group[0]?.order, taskCount: group.length, existingItems: items });
        }
        results.sort((a, b) => (b.order?.updated_at ? new Date(b.order.updated_at).getTime() : 0) - (a.order?.updated_at ? new Date(a.order.updated_at).getTime() : 0));
        return results;
    }
    async softDelete(id, actorUserId) {
        const exists = await this.prisma.inventoryitem.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Inventory tidak ditemukan');
        if (exists.is_deleted)
            return exists;
        const deleted = await this.prisma.inventoryitem.update({ where: { id }, data: { is_deleted: true, deleted_at: new Date(), updated_at: new Date() } });
        try {
            await this.prisma.inventoryitemhistory.create({
                data: { inventoryItemId: id, action: 'DELETED', userId: actorUserId ?? null, snapshot: JSON.stringify(deleted) }
            });
        }
        catch { }
        try {
            this.realtime.emitAll({ type: 'inventory.updated', itemId: id, orderId: exists?.orderId });
        }
        catch { }
        return deleted;
    }
    async restore(id, actorUserId) {
        const exists = await this.prisma.inventoryitem.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Inventory tidak ditemukan');
        if (!exists.is_deleted)
            return exists;
        const restored = await this.prisma.inventoryitem.update({ where: { id }, data: { is_deleted: false, deleted_at: null, updated_at: new Date() } });
        try {
            await this.prisma.inventoryitemhistory.create({
                data: { inventoryItemId: id, action: 'RESTORED', userId: actorUserId ?? null, snapshot: JSON.stringify(restored) }
            });
        }
        catch { }
        try {
            this.realtime.emitAll({ type: 'inventory.updated', itemId: id, orderId: exists?.orderId });
        }
        catch { }
        return restored;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, realtime_service_1.RealtimeService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map
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
            const existsSame = await this.prisma.inventoryItem.findFirst({
                where: { category: dto.category, code: { equals: dto.code, mode: 'insensitive' } },
                select: { id: true },
            });
            if (existsSame)
                throw new common_1.BadRequestException('Kode inventory sudah dipakai dalam kategori tersebut');
        }
        const data = {
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
            const created = await this.prisma.inventoryItem.create({ data });
            try {
                await this.prisma.orderHistory.create({
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
            }
            catch { }
            try {
                await this.prisma.orderTask.updateMany({
                    where: {
                        orderId: dto.orderId,
                        jobRole: 'INVENTORY',
                        assignedToId: actorUserId ?? undefined,
                        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
                    },
                    data: { status: 'AWAITING_VALIDATION', requestedDoneAt: new Date() },
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
        const exists = await this.prisma.inventoryItem.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Inventory tidak ditemukan');
        const data = {
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
            const updated = await this.prisma.inventoryItem.update({ where: { id }, data });
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
        return this.prisma.inventoryItem.findUnique({ where: { id } });
    }
    listByOrder(orderId) {
        return this.prisma.inventoryItem.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
    }
    async search(params) {
        const where = {};
        if (params.category)
            where.category = params.category;
        if (params.status)
            where.status = params.status;
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
            if (params.dateFrom)
                where.createdAt.gte = new Date(params.dateFrom);
            if (params.dateTo)
                where.createdAt.lte = new Date(params.dateTo);
        }
        const take = Math.min(Number(params.limit || 50), 200);
        const skip = Math.max(Number(params.offset || 0), 0);
        const [items, total] = await this.prisma.$transaction([
            this.prisma.inventoryItem.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
            this.prisma.inventoryItem.count({ where }),
        ]);
        return { items, total, take, skip };
    }
    async listRequestsForInventory(userId) {
        const tasks = await this.prisma.orderTask.findMany({
            where: { jobRole: 'INVENTORY', status: { in: ['ASSIGNED', 'IN_PROGRESS'] }, ...(userId ? { assignedToId: userId } : {}) },
            orderBy: { createdAt: 'desc' },
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
            const items = await this.prisma.inventoryItem.count({ where: { orderId } });
            results.push({ orderId, order: group[0]?.order, taskCount: group.length, existingItems: items });
        }
        results.sort((a, b) => (b.order?.updatedAt ? new Date(b.order.updatedAt).getTime() : 0) - (a.order?.updatedAt ? new Date(a.order.updatedAt).getTime() : 0));
        return results;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, realtime_service_1.RealtimeService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map
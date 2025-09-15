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
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actorUserId) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
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
            return this.prisma.inventoryItem.create({ data });
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
            return this.prisma.inventoryItem.update({ where: { id }, data });
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map
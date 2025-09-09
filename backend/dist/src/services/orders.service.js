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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const dayjs = require("dayjs");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
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
                    dp: dto.dp != null ? dto.dp : null,
                    ...(dto.promisedReadyDate ? { promisedReadyDate: new Date(dto.promisedReadyDate) } : {}),
                    tanggalSelesai: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : undefined,
                    tanggalAmbil: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : undefined,
                    catatan: dto.catatan,
                    ...(dto.referensiGambarUrls ? { referensiGambarUrls: dto.referensiGambarUrls } : {}),
                    status: 'DRAFT',
                    createdById: userId,
                    updatedById: userId,
                },
            });
            let stoneCount = 0;
            let totalBerat = null;
            if (dto.stones && dto.stones.length) {
                await tx.orderStone.createMany({
                    data: dto.stones.map(s => ({ orderId: order.id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat }))
                });
                stoneCount = dto.stones.length;
                const sum = dto.stones.reduce((acc, s) => acc + (s.berat ? Number(s.berat) : 0), 0);
                totalBerat = new client_1.Prisma.Decimal(sum.toFixed(2));
            }
            const code = `TM-${dayjs(order.createdAt).format('YYYYMM')}-${String(order.id).padStart(4, '0')}`;
            const updated = await tx.order.update({ where: { id: order.id }, data: { code, stoneCount, totalBerat: totalBerat } });
            try {
                await tx.orderTask.create({ data: { orderId: order.id, stage: 'Awal', status: 'OPEN' } });
            }
            catch (e) {
            }
            return updated;
        });
        return this.findById(created.id);
    }
    async findAll(params) {
        return this.prisma.order.findMany({
            where: params.status ? { status: params.status } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { stones: true },
        });
    }
    async findById(id) {
        const order = await this.prisma.order.findUnique({ where: { id }, include: { stones: true } });
        if (!order)
            throw new common_1.NotFoundException('Order tidak ditemukan');
        return order;
    }
    async updateStatus(id, dto, userId) {
        const order = await this.findById(id);
        const allowed = {
            DRAFT: ['DITERIMA', 'BATAL'],
            DITERIMA: ['DALAM_PROSES', 'BATAL'],
            DALAM_PROSES: ['SIAP', 'BATAL'],
            SIAP: ['DIAMBIL', 'BATAL'],
            DIAMBIL: [],
            BATAL: [],
        };
        if (!allowed[order.status].includes(dto.status)) {
            throw new common_1.BadRequestException('Transition status tidak valid');
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
    async history(id) {
        await this.findById(id);
        const records = await this.prisma.orderHistory.findMany({
            where: { orderId: id },
            include: { user: { select: { id: true, fullName: true, jobRole: true } } },
            orderBy: { changedAt: 'asc' }
        });
        return records.map((r) => ({
            id: r.id,
            changedAt: r.changedAt,
            by: r.user ? { id: r.user.id, fullName: r.user.fullName, jobRole: r.user.jobRole ?? null } : null,
            summary: r.changeSummary,
            diff: r.diff
        }));
    }
    async update(id, dto, userId) {
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
                dp: dto.dp ?? order.dp,
                hargaEmasPerGram: dto.hargaEmasPerGram ?? order.hargaEmasPerGram,
                hargaPerkiraan: dto.hargaPerkiraan ?? order.hargaPerkiraan,
                hargaAkhir: dto.hargaAkhir ?? order.hargaAkhir,
                promisedReadyDate: dto.promisedReadyDate ? new Date(dto.promisedReadyDate) : order.promisedReadyDate,
                tanggalSelesai: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : order.tanggalSelesai,
                tanggalAmbil: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : order.tanggalAmbil,
                catatan: dto.catatan ?? order.catatan,
                referensiGambarUrls: dto.referensiGambarUrls ?? order.referensiGambarUrls,
                updatedById: userId,
            },
        });
        await this.prisma.orderHistory.create({
            data: {
                orderId: id,
                userId,
                changeSummary: 'EDIT ORDER',
                diff: dto,
            },
        });
        return updated;
    }
    async remove(id, userId) {
        const order = await this.findById(id);
        if (order.status === 'DIAMBIL' || order.status === 'BATAL') {
            throw new common_1.BadRequestException('Tidak dapat menghapus order history/non-aktif');
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
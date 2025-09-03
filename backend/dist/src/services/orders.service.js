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
const dayjs_1 = require("dayjs");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        if (dto.dp && dto.ongkos && Number(dto.dp) > Number(dto.ongkos)) {
            throw new common_1.BadRequestException('DP tidak boleh lebih besar dari ongkos');
        }
        const order = await this.prisma.order.create({
            data: {
                customerName: dto.customerName,
                customerAddress: dto.customerAddress,
                customerPhone: dto.customerPhone,
                jenisBarang: dto.jenisBarang,
                jenisEmas: dto.jenisEmas,
                warnaEmas: dto.warnaEmas,
                ongkos: dto.ongkos,
                hargaEmasPerGram: dto.hargaEmasPerGram,
                hargaPerkiraan: dto.hargaPerkiraan,
                hargaAkhir: dto.hargaAkhir,
                dp: dto.dp || 0,
                tanggalJanjiJadi: dto.tanggalJanjiJadi ? new Date(dto.tanggalJanjiJadi) : undefined,
                tanggalSelesai: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : undefined,
                tanggalAmbil: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : undefined,
                catatan: dto.catatan,
                referensiGambarUrl: dto.referensiGambarUrl || (dto.referensiGambarUrls && dto.referensiGambarUrls[0]) || null,
                ...(dto.referensiGambarUrls ? { referensiGambarUrls: dto.referensiGambarUrls } : {}),
                status: 'DRAFT',
                createdById: userId,
                updatedById: userId,
            },
        });
        if (dto.stones && dto.stones.length) {
            await this.prisma.orderStone.createMany({
                data: dto.stones.map(s => ({ orderId: order.id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat }))
            });
        }
        const code = `TM-${(0, dayjs_1.default)(order.createdAt).format('YYYYMM')}-${String(order.id).padStart(4, '0')}`;
        await this.prisma.order.update({ where: { id: order.id }, data: { code } });
        return this.findById(order.id);
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
        if (dto.status === 'SIAP' && dto.beratAkhir == null) {
            throw new common_1.BadRequestException('Berat akhir wajib saat set SIAP');
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                status: dto.status,
                beratAkhir: dto.beratAkhir ?? order.beratAkhir,
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
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
const crypto_1 = require("crypto");
const dayjs = require("dayjs");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapOrder(o) {
        if (!o)
            return o;
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
            referensiGambarUrls: o.reference_image_urls ? (() => { try {
                return JSON.parse(o.reference_image_urls);
            }
            catch {
                return [];
            } })() : [],
            stoneCount: o.stone_count ?? 0,
            totalBerat: o.total_stone_weight != null ? Number(o.total_stone_weight) : null,
            totalStoneWeight: o.total_stone_weight != null ? Number(o.total_stone_weight) : null,
            createdAt: o.created_at ?? null,
            updatedAt: o.updated_at ?? null,
            createdById: o.created_by_id ?? null,
            updatedById: o.updated_by_id ?? null,
            stones: Array.isArray(o.orderstone) ? o.orderstone.map((s) => ({ id: s.id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat != null ? Number(s.berat) : null })) : [],
        };
    }
    async create(dto, userId) {
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
                    gold_price_per_gram: dto.hargaEmasPerGram ?? null,
                    estimated_price: dto.hargaPerkiraan ?? null,
                    final_price: dto.hargaAkhir ?? null,
                    down_payment: dto.dp ?? null,
                    promised_ready_date: dto.promisedReadyDate ? new Date(dto.promisedReadyDate) : null,
                    completed_date: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : null,
                    pickup_date: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : null,
                    notes: dto.catatan ?? null,
                    reference_image_urls: dto.referensiGambarUrls ? JSON.stringify(dto.referensiGambarUrls) : null,
                    status: 'MENUNGGU',
                    created_by_id: userId,
                    updated_by_id: userId,
                    updated_at: new Date(),
                },
            });
            let stoneCount = 0;
            let totalBerat = null;
            if (dto.stones && dto.stones.length) {
                await tx.orderstone.createMany({
                    data: dto.stones.map(s => ({ orderId: order.id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat }))
                });
                const totalJumlah = dto.stones.reduce((acc, s) => acc + (s.jumlah || 0), 0);
                stoneCount = totalJumlah;
                const sum = dto.stones.reduce((acc, s) => acc + (s.berat ? Number(s.berat) : 0), 0);
                totalBerat = new client_1.Prisma.Decimal(sum.toFixed(2));
            }
            const code = `TM-${dayjs(order.created_at).format('YYYYMM')}-${String(order.id).padStart(4, '0')}`;
            const updated = await tx.order.update({ where: { id: order.id }, data: { code, stone_count: stoneCount, total_stone_weight: totalBerat } });
            try {
                await tx.ordertask.create({ data: { orderId: order.id, stage: 'Awal', status: 'OPEN', updated_at: new Date() } });
            }
            catch (e) {
            }
            try {
                const user = await this.prisma.account.findUnique({ where: { id: userId }, select: { fullName: true, job_role: true } });
                await tx.orderhistory.create({
                    data: ({
                        orderId: order.id,
                        userId,
                        action: 'CREATED',
                        actorName: user?.fullName ?? null,
                        actorRole: user?.job_role ?? null,
                        orderCode: updated.code ?? null,
                        changeSummary: 'CREATE ORDER',
                    }),
                });
            }
            catch { }
            return updated;
        });
        return this.findById(created.id);
    }
    async findAll(params) {
        const rows = await this.prisma.order.findMany({
            where: params.status ? { status: params.status } : undefined,
            orderBy: { created_at: 'desc' },
            include: { orderstone: true },
        });
        return rows.map(r => this.mapOrder(r));
    }
    async findById(id) {
        const order = await this.prisma.order.findUnique({ where: { id }, include: { orderstone: true } });
        if (!order)
            throw new common_1.NotFoundException('Order tidak ditemukan');
        return this.mapOrder(order);
    }
    async updateStatus(id, dto, userId) {
        const order = await this.findById(id);
        const allowed = {
            MENUNGGU: ['DALAM_PROSES', 'BATAL'],
            DALAM_PROSES: ['SIAP', 'BATAL'],
            SIAP: ['DIAMBIL', 'BATAL'],
            DIAMBIL: [],
            BATAL: [],
        };
        const currentStatus = order.status;
        if (!allowed[currentStatus].includes(dto.status)) {
            throw new common_1.BadRequestException('Transition status tidak valid');
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
                actorRole: user?.job_role ?? null,
                statusFrom: order.status,
                statusTo: dto.status,
                orderCode: order.code ?? null,
                changeSummary: `STATUS: ${order.status} -> ${dto.status}`,
                diff: JSON.stringify({ from: order.status, to: dto.status }),
            }),
        });
        return this.mapOrder(updated);
    }
    async history(id) {
        await this.findById(id);
        const records = await this.prisma.orderhistory.findMany({
            where: { orderId: id },
            include: { account: { select: { id: true, fullName: true, job_role: true } } },
            orderBy: { changedAt: 'asc' }
        });
        return records.map((r) => ({
            id: r.id,
            changedAt: r.changedAt,
            by: r.account ? { id: r.account.id, fullName: r.account.fullName, jobRole: r.account.job_role ?? null } : r.actorName ? { id: r.userId, fullName: r.actorName, jobRole: r.actorRole ?? null } : null,
            action: r.action,
            statusFrom: r.statusFrom ?? null,
            statusTo: r.statusTo ?? null,
            summary: r.changeSummary,
            diff: r.diff ? JSON.parse(r.diff) : null,
        }));
    }
    async update(id, dto, userId) {
        const updatedCore = await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id } });
            if (!order)
                throw new common_1.NotFoundException('Order tidak ditemukan');
            const data = {
                customer_name: dto.customerName ?? order.customer_name,
                customer_address: dto.customerAddress ?? order.customer_address,
                customer_phone: dto.customerPhone ?? order.customer_phone,
                item_type: dto.jenisBarang ?? order.item_type,
                gold_type: dto.jenisEmas ?? order.gold_type,
                gold_color: dto.warnaEmas ?? order.gold_color,
                ring_size: dto.ringSize ?? order.ring_size,
                down_payment: dto.dp ?? order.down_payment,
                gold_price_per_gram: dto.hargaEmasPerGram ?? order.gold_price_per_gram,
                estimated_price: dto.hargaPerkiraan ?? order.estimated_price,
                final_price: dto.hargaAkhir ?? order.final_price,
                promised_ready_date: dto.promisedReadyDate ? new Date(dto.promisedReadyDate) : order.promised_ready_date,
                completed_date: dto.tanggalSelesai ? new Date(dto.tanggalSelesai) : order.completed_date,
                pickup_date: dto.tanggalAmbil ? new Date(dto.tanggalAmbil) : order.pickup_date,
                notes: dto.catatan ?? order.notes,
                reference_image_urls: dto.referensiGambarUrls ? JSON.stringify(dto.referensiGambarUrls) : order.reference_image_urls,
                updated_by_id: userId ?? order.updated_by_id,
                updated_at: new Date(),
            };
            try {
                console.log('[OrdersService.update] id=', id, 'patchKeys=', Object.keys(dto || {}));
            }
            catch { }
            const updated = await tx.order.update({ where: { id }, data });
            const fields = ['customerName', 'customerAddress', 'customerPhone', 'jenisBarang', 'jenisEmas', 'warnaEmas', 'ringSize', 'dp', 'hargaEmasPerGram', 'hargaPerkiraan', 'hargaAkhir', 'promisedReadyDate', 'tanggalSelesai', 'tanggalAmbil', 'catatan', 'referensiGambarUrls'];
            const prevPatch = {};
            const nextPatch = {};
            for (const k of fields) {
                const newVal = dto[k];
                if (newVal !== undefined) {
                    const oldVal = order[k];
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
                    await tx.orderstone.createMany({ data: dto.stones.map(s => ({ orderId: id, bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat })) });
                }
                const stones = dto.stones;
                const stoneCount = stones.reduce((acc, s) => acc + (s.jumlah || 0), 0);
                const sum = stones.reduce((acc, s) => acc + (s.berat ? Number(s.berat) : 0), 0);
                const totalBerat = new client_1.Prisma.Decimal(sum.toFixed(2));
                await tx.order.update({ where: { id }, data: { stone_count: stoneCount, total_stone_weight: totalBerat } });
                nextPatch['stone_count'] = stoneCount;
                nextPatch['total_stone_weight'] = totalBerat;
            }
            try {
                const user = await this.prisma.account.findUnique({ where: { id: userId }, select: { fullName: true, job_role: true } });
                const groupId = (0, crypto_1.randomUUID)();
                await tx.orderhistory.create({
                    data: ({
                        orderId: id,
                        userId,
                        action: 'UPDATED',
                        actorName: user?.fullName ?? null,
                        actorRole: user?.job_role ?? null,
                        orderCode: updated.code ?? null,
                        changeSummary: 'EDIT ORDER',
                        prev: Object.keys(prevPatch).length ? JSON.stringify(prevPatch) : undefined,
                        next: Object.keys(nextPatch).length ? JSON.stringify(nextPatch) : undefined,
                        diff: JSON.stringify(dto),
                        groupId,
                    }),
                });
            }
            catch { }
            return updated;
        });
        try {
            console.log('[OrdersService.update] done id=', id);
        }
        catch { }
        return this.findById(id);
    }
    async remove(id, userId) {
        const order = await this.findById(id);
        if (order.status === 'DIAMBIL' || order.status === 'BATAL') {
            throw new common_1.BadRequestException('Tidak dapat menghapus order history/non-aktif');
        }
        await this.prisma.orderhistory.deleteMany({ where: { orderId: id } });
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
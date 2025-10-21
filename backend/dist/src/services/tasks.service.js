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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const task_dtos_1 = require("../types/task.dtos");
let TasksService = TasksService_1 = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TasksService_1.name);
    }
    isOrderActive(status) {
        return status === 'DRAFT' || status === 'DITERIMA' || status === 'DALAM_PROSES';
    }
    async backfillActive() {
        const activeStatuses = ['DRAFT', 'DITERIMA', 'DALAM_PROSES'];
        const orders = await this.prisma.order.findMany({ where: { status: { in: activeStatuses } }, select: { id: true } });
        if (!orders.length)
            return { created: 0 };
        const missing = [];
        for (const o of orders) {
            const c = await this.prisma.orderTask.count({ where: { orderId: o.id } });
            if (c === 0)
                missing.push(o.id);
        }
        if (!missing.length)
            return { created: 0 };
        await this.prisma.$transaction(missing.map(id => this.prisma.orderTask.create({ data: { orderId: id, stage: 'Awal', status: 'OPEN' } })));
        return { created: missing.length };
    }
    listActive() {
        return (async () => {
            const rows = await this.prisma.orderTask.findMany({
                where: {
                    status: { not: task_dtos_1.TaskStatus.DONE },
                    order: { status: { in: ['DRAFT', 'DITERIMA', 'DALAM_PROSES'] } },
                },
                orderBy: { createdAt: 'desc' },
                include: { order: true, assignedTo: true, validatedBy: true },
            });
            if (!rows.length)
                return rows;
            const ids = rows.map((r) => r.id);
            try {
                if (!ids.length)
                    return rows;
                const fragments = ids.map(() => `?`).join(',');
                const sql = `SELECT id, is_checked FROM OrderTask WHERE id IN (${fragments})`;
                const checks = await this.prisma.$queryRawUnsafe(sql, ...ids);
                const map = new Map();
                checks.forEach((c) => map.set(Number(c.id), c));
                rows.forEach((r) => { const c = map.get(Number(r.id)); if (c)
                    r.isChecked = !!c.is_checked; });
            }
            catch { }
            return rows;
        })();
    }
    async listByOrder(orderId) {
        const rows = await this.prisma.orderTask.findMany({
            where: { orderId: Number(orderId) },
            orderBy: { createdAt: 'asc' },
            include: { assignedTo: true },
        });
        if (!rows.length)
            return rows;
        try {
            const sql = `SELECT id, is_checked FROM OrderTask WHERE orderId = ?`;
            const checks = await this.prisma.$queryRawUnsafe(sql, Number(orderId));
            const map = new Map();
            checks.forEach((c) => map.set(Number(c.id), c));
            rows.forEach((r) => { const c = map.get(Number(r.id)); if (c)
                r.isChecked = !!c.is_checked; });
        }
        catch { }
        return rows;
    }
    async listAwaitingValidationByOrder(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.prisma.orderTask.findMany({
            where: { orderId, status: task_dtos_1.TaskStatus.AWAITING_VALIDATION },
            orderBy: { createdAt: 'desc' },
            include: { assignedTo: true }
        });
    }
    async create(data) {
        const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        return this.prisma.orderTask.create({ data: { orderId: data.orderId, stage: data.stage, notes: data.notes, status: task_dtos_1.TaskStatus.OPEN } });
    }
    async update(id, patch) {
        const exists = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!exists)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(exists.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        return this.prisma.orderTask.update({ where: { id }, data: { ...patch } });
    }
    async remove(id) {
        const exists = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!exists)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(exists.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        await this.prisma.orderTask.delete({ where: { id } });
        return { success: true };
    }
    async assign(id, assignedToId, actorUserId) {
        const task = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const ops = [];
        if (task.order && task.order.status === 'DRAFT') {
            const actor = actorUserId ? await this.prisma.appUser.findUnique({ where: { id: actorUserId }, select: { fullName: true, jobRole: true } }) : null;
            ops.push(this.prisma.order.update({ where: { id: task.orderId }, data: { status: 'DITERIMA' } }));
            ops.push(this.prisma.orderHistory.create({
                data: ({
                    orderId: task.orderId,
                    userId: actorUserId ?? null,
                    action: 'STATUS_CHANGED',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.jobRole ?? null,
                    statusFrom: 'DRAFT',
                    statusTo: 'DITERIMA',
                    orderCode: task.order?.code ?? null,
                    changeSummary: `STATUS: DRAFT -> DITERIMA`,
                    diff: { from: 'DRAFT', to: 'DITERIMA' },
                }),
            }));
        }
        ops.push(this.prisma.orderTask.update({ where: { id }, data: { assignedToId, status: task_dtos_1.TaskStatus.ASSIGNED } }));
        const txResult = await this.prisma.$transaction(ops);
        return txResult[txResult.length - 1];
    }
    async assignBulk(params) {
        const order = await this.prisma.order.findUnique({ where: { id: params.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const user = await this.prisma.appUser.findUnique({ where: { id: params.userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const blockingStatuses = ['ASSIGNED', 'IN_PROGRESS', 'AWAITING_VALIDATION'];
        const existingActive = await this.prisma.orderTask.findMany({
            where: { orderId: params.orderId, status: { in: blockingStatuses }, assignedToId: { not: null } },
            include: { assignedTo: true },
        });
        if (existingActive && existingActive.length > 0) {
            const names = Array.from(new Set(existingActive.map((t) => t.assignedTo?.fullName || t.assignedToId))).filter(Boolean);
            const who = names.length ? ` (${names.join(', ')})` : '';
            throw new common_1.BadRequestException(`Pesanan sedang dikerjakan${who}. Tidak bisa assign lagi sebelum verifikasi disetujui.`);
        }
        const creates = params.subtasks.map(st => this.prisma.orderTask.create({
            data: {
                orderId: params.orderId,
                stage: st.stage,
                notes: st.notes,
                assignedToId: params.userId,
                jobRole: params.role,
                status: task_dtos_1.TaskStatus.ASSIGNED,
            },
        }));
        const updates = [];
        if (order.status === 'DRAFT') {
            const actor = params.actorUserId ? await this.prisma.appUser.findUnique({ where: { id: params.actorUserId }, select: { fullName: true, jobRole: true } }) : null;
            updates.push(this.prisma.order.update({ where: { id: params.orderId }, data: { status: 'DITERIMA' } }));
            updates.push(this.prisma.orderHistory.create({
                data: ({
                    orderId: params.orderId,
                    userId: params.actorUserId ?? null,
                    action: 'STATUS_CHANGED',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.jobRole ?? null,
                    statusFrom: 'DRAFT',
                    statusTo: 'DITERIMA',
                    orderCode: order.code ?? null,
                    changeSummary: `STATUS: DRAFT -> DITERIMA`,
                    diff: { from: 'DRAFT', to: 'DITERIMA' },
                }),
            }));
        }
        updates.push(...creates);
        await this.prisma.$transaction(updates);
        return { created: creates.length };
    }
    async requestDone(id, requesterUserId, notes) {
        this.logger.debug(`requestDone id=${id} by=${requesterUserId}`);
        const task = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        if (task.assignedToId && task.assignedToId !== requesterUserId)
            throw new common_1.BadRequestException('Hanya yang ditugaskan yang bisa request selesai');
        const selfCheck = await this.prisma.$queryRaw `SELECT is_checked FROM OrderTask WHERE id = ${Number(id)} LIMIT 1`;
        const isSelfChecked = !!(selfCheck?.[0]?.is_checked);
        if (task.status !== task_dtos_1.TaskStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Task harus dalam status IN_PROGRESS untuk request selesai');
        }
        if (!isSelfChecked) {
            throw new common_1.BadRequestException('Checklist wajib dicentang sebelum request selesai');
        }
        const rows = await this.prisma.$queryRaw `SELECT id, status, is_checked FROM OrderTask WHERE orderId = ${Number(task.orderId)} AND assigned_to_id = ${requesterUserId} AND status IN ('ASSIGNED','IN_PROGRESS')`;
        const hasUnstarted = rows.some(r => String(r.status) === 'ASSIGNED');
        if (hasUnstarted) {
            throw new common_1.BadRequestException('Ada sub-tugas yang belum dimulai/di-checklist. Mohon checklist semua dulu.');
        }
        const anyUnchecked = rows.some(r => String(r.status) === 'IN_PROGRESS' && !r.is_checked);
        if (anyUnchecked) {
            throw new common_1.BadRequestException('Semua sub-tugas harus dichecklist sebelum bisa request selesai.');
        }
        try {
            const res = await this.prisma.orderTask.update({ where: { id }, data: { notes: notes ?? task.notes, requestedDoneAt: new Date(), status: task_dtos_1.TaskStatus.AWAITING_VALIDATION } });
            try {
                const actor = await this.prisma.appUser.findUnique({ where: { id: requesterUserId }, select: { fullName: true, jobRole: true } });
                await this.prisma.orderHistory.create({
                    data: ({
                        orderId: task.orderId,
                        userId: requesterUserId,
                        action: 'TASK_EVENT',
                        actorName: actor?.fullName ?? null,
                        actorRole: actor?.jobRole ?? null,
                        orderCode: task.order?.code ?? null,
                        changeSummary: `TASK_REQUESTED_VALIDATION (task#${id})`,
                        diff: { taskId: id, event: 'REQUEST_VALIDATION', notes: notes ?? null },
                    }),
                });
            }
            catch { }
            this.logger.debug(`requestDone OK id=${id}`);
            return res;
        }
        catch (e) {
            this.logger.error(`requestDone FAIL id=${id} by=${requesterUserId}: ${e?.message}`, e?.stack);
            throw new common_1.BadRequestException(e?.message || 'Gagal mengajukan verifikasi');
        }
    }
    async validateDone(id, validatorUserId, notes) {
        const task = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const updated = await this.prisma.orderTask.update({ where: { id }, data: { validatedById: validatorUserId, validatedAt: new Date(), notes: notes ?? task.notes, status: task_dtos_1.TaskStatus.DONE } });
        try {
            const actor = await this.prisma.appUser.findUnique({ where: { id: validatorUserId }, select: { fullName: true, jobRole: true } });
            await this.prisma.orderHistory.create({
                data: ({
                    orderId: task.orderId,
                    userId: validatorUserId,
                    action: 'TASK_EVENT',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.jobRole ?? null,
                    orderCode: task.order?.code ?? null,
                    changeSummary: `TASK_VALIDATED (task#${id})`,
                    diff: { taskId: id, event: 'TASK_VALIDATED', notes: notes ?? null },
                }),
            });
        }
        catch { }
        return updated;
    }
    async validateAllForOrderAndUser(orderId, targetUserId, validatorUserId, notes) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const tasks = await this.prisma.orderTask.findMany({
            where: { orderId, assignedToId: targetUserId, status: task_dtos_1.TaskStatus.AWAITING_VALIDATION },
            select: { id: true },
        });
        if (!tasks.length)
            return { updated: 0 };
        const ops = tasks.map(t => this.prisma.orderTask.update({
            where: { id: t.id },
            data: { validatedById: validatorUserId, validatedAt: new Date(), notes, status: task_dtos_1.TaskStatus.DONE },
        }));
        await this.prisma.$transaction(ops);
        try {
            const actor = await this.prisma.appUser.findUnique({ where: { id: validatorUserId }, select: { fullName: true, jobRole: true } });
            await this.prisma.orderHistory.create({
                data: ({
                    orderId,
                    userId: validatorUserId,
                    action: 'TASK_EVENT',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.jobRole ?? null,
                    orderCode: order.code ?? null,
                    changeSummary: `TASKS_VALIDATED user=${targetUserId}`,
                    diff: { userId: targetUserId, event: 'TASKS_VALIDATED', count: tasks.length, notes: notes ?? null },
                }),
            });
        }
        catch { }
        return { updated: tasks.length };
    }
    async requestDoneForOrderForUser(orderId, requesterUserId, notes) {
        this.logger.debug(`requestDoneForOrderForUser order=${orderId} by=${requesterUserId}`);
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const rows = await this.prisma.$queryRaw `SELECT id, status, is_checked FROM OrderTask WHERE orderId = ${Number(orderId)} AND assigned_to_id = ${requesterUserId} AND status IN ('ASSIGNED','IN_PROGRESS')`;
        if (rows.length === 0)
            throw new common_1.BadRequestException('Tidak ada tugas yang bisa diajukan');
        if (rows.some(r => String(r.status) === 'ASSIGNED'))
            throw new common_1.BadRequestException('Ada sub-tugas yang belum dimulai. Checklist untuk memulai.');
        if (rows.some(r => String(r.status) === 'IN_PROGRESS' && !r.is_checked))
            throw new common_1.BadRequestException('Semua sub-tugas harus dichecklist dulu.');
        const ids = rows.filter(r => String(r.status) === 'IN_PROGRESS').map(r => Number(r.id));
        if (!ids.length)
            return { updated: 0 };
        try {
            const updates = ids.map(id => this.prisma.orderTask.update({ where: { id }, data: { notes, requestedDoneAt: new Date(), status: task_dtos_1.TaskStatus.AWAITING_VALIDATION } }));
            await this.prisma.$transaction(updates);
            try {
                const actor = await this.prisma.appUser.findUnique({ where: { id: requesterUserId }, select: { fullName: true, jobRole: true } });
                await this.prisma.orderHistory.create({
                    data: ({
                        orderId,
                        userId: requesterUserId,
                        action: 'TASK_EVENT',
                        actorName: actor?.fullName ?? null,
                        actorRole: actor?.jobRole ?? null,
                        orderCode: order.code ?? null,
                        changeSummary: `TASKS_REQUESTED_VALIDATION user=${requesterUserId}`,
                        diff: { userId: requesterUserId, event: 'REQUEST_VALIDATION_BULK', count: ids.length, notes: notes ?? null },
                    }),
                });
            }
            catch { }
            this.logger.debug(`requestDoneForOrderForUser OK order=${orderId} updated=${ids.length}`);
            return { updated: ids.length };
        }
        catch (e) {
            this.logger.error(`requestDoneForOrderForUser FAIL order=${orderId} by=${requesterUserId}: ${e?.message}`, e?.stack);
            throw new common_1.BadRequestException(e?.message || 'Gagal mengajukan verifikasi');
        }
    }
    async setChecked(id, actorUserId, value) {
        this.logger.debug(`setChecked id=${id} by=${actorUserId} value=${value}`);
        const task = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        if (task.assignedToId && task.assignedToId !== actorUserId)
            throw new common_1.BadRequestException('Hanya yang ditugaskan yang bisa mengubah checklist');
        if (task.status === task_dtos_1.TaskStatus.AWAITING_VALIDATION || task.status === task_dtos_1.TaskStatus.DONE) {
            throw new common_1.BadRequestException('Checklist tidak bisa diubah setelah request selesai diajukan atau divalidasi');
        }
        if (task.status === task_dtos_1.TaskStatus.ASSIGNED && value) {
            throw new common_1.BadRequestException('Mohon terima pesanan terlebih dahulu untuk memulai.');
        }
        const checkedVal = value ? 1 : 0;
        await this.prisma.$executeRaw `UPDATE OrderTask SET is_checked = ${checkedVal}, checked_at = ${value ? new Date() : null}, checked_by_id = ${value ? actorUserId : null} WHERE id = ${Number(id)}`;
        const updated = await this.prisma.orderTask.findUnique({ where: { id } });
        return { ...updated, isChecked: !!value };
    }
    async start(id, actorUserId) {
        this.logger.debug(`start id=${id} by=${actorUserId}`);
        const task = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        if (task.status !== task_dtos_1.TaskStatus.ASSIGNED)
            throw new common_1.BadRequestException('Hanya task ASSIGNED yang bisa dimulai');
        if (task.assignedToId && task.assignedToId !== actorUserId)
            throw new common_1.BadRequestException('Hanya yang ditugaskan yang bisa memulai');
        const ops = [];
        if (task.order && (task.order.status === 'DRAFT' || task.order.status === 'DITERIMA')) {
            const actor = await this.prisma.appUser.findUnique({ where: { id: actorUserId }, select: { fullName: true, jobRole: true } });
            ops.push(this.prisma.order.update({ where: { id: task.orderId }, data: { status: 'DALAM_PROSES' } }));
            ops.push(this.prisma.orderHistory.create({
                data: ({
                    orderId: task.orderId,
                    userId: actorUserId,
                    action: 'STATUS_CHANGED',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.jobRole ?? null,
                    statusFrom: task.order.status,
                    statusTo: 'DALAM_PROSES',
                    orderCode: task.order?.code ?? null,
                    changeSummary: `STATUS: ${task.order.status} -> DALAM_PROSES`,
                    diff: { from: task.order.status, to: 'DALAM_PROSES' },
                }),
            }));
        }
        ops.push(this.prisma.orderTask.update({ where: { id }, data: { status: task_dtos_1.TaskStatus.IN_PROGRESS } }));
        const res = await this.prisma.$transaction(ops);
        return res[res.length - 1];
    }
    async acceptOrderForUser(orderId, actorUserId) {
        this.logger.debug(`acceptOrderForUser order=${orderId} by=${actorUserId}`);
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const tasks = await this.prisma.orderTask.findMany({
            where: { orderId, assignedToId: actorUserId, status: task_dtos_1.TaskStatus.ASSIGNED },
            select: { id: true },
        });
        if (!tasks.length)
            throw new common_1.BadRequestException('Tidak ada tugas ASSIGNED untuk diterima');
        const ops = tasks.map(t => this.prisma.orderTask.update({ where: { id: t.id }, data: { status: task_dtos_1.TaskStatus.IN_PROGRESS } }));
        if (order.status === 'DRAFT' || order.status === 'DITERIMA') {
            const actor = await this.prisma.appUser.findUnique({ where: { id: actorUserId }, select: { fullName: true, jobRole: true } });
            ops.unshift(this.prisma.order.update({ where: { id: orderId }, data: { status: 'DALAM_PROSES' } }));
            ops.unshift(this.prisma.orderHistory.create({
                data: ({
                    orderId,
                    userId: actorUserId,
                    action: 'STATUS_CHANGED',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.jobRole ?? null,
                    statusFrom: order.status,
                    statusTo: 'DALAM_PROSES',
                    orderCode: order.code ?? null,
                    changeSummary: `STATUS: ${order.status} -> DALAM_PROSES`,
                    diff: { from: order.status, to: 'DALAM_PROSES' },
                }),
            }));
        }
        await this.prisma.$transaction(ops);
        return { accepted: tasks.length };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
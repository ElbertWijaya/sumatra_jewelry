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
        return status === 'MENUNGGU' || status === 'DALAM_PROSES';
    }
    mapTask(row) {
        if (!row)
            return row;
        const o = row.order;
        const mappedOrder = o ? {
            id: o.id,
            code: o.code ?? null,
            status: o.status ?? null,
            customerName: o.customer_name ?? null,
            customer_name: o.customer_name ?? null,
            customerPhone: o.customer_phone ?? null,
            customer_phone: o.customer_phone ?? null,
            customerAddress: o.customer_address ?? null,
            customer_address: o.customer_address ?? null,
            jenisBarang: o.item_type ?? null,
            item_type: o.item_type ?? null,
            jenisEmas: o.gold_type ?? null,
            gold_type: o.gold_type ?? null,
            warnaEmas: o.gold_color ?? null,
            gold_color: o.gold_color ?? null,
            ringSize: o.ring_size ?? null,
            ring_size: o.ring_size ?? null,
            createdAt: o.created_at ?? null,
            created_at: o.created_at ?? null,
            promisedReadyDate: o.promised_ready_date ?? null,
            promised_ready_date: o.promised_ready_date ?? null,
            tanggalSelesai: o.completed_date ?? null,
            completed_date: o.completed_date ?? null,
            tanggalAmbil: o.pickup_date ?? null,
            pickup_date: o.pickup_date ?? null,
            catatan: o.notes ?? null,
            notes: o.notes ?? null,
            referensiGambarUrls: o.reference_image_urls ? (() => { try {
                return JSON.parse(o.reference_image_urls);
            }
            catch {
                return [];
            } })() : [],
        } : null;
        return {
            id: row.id,
            orderId: row.orderId,
            stage: row.stage,
            status: row.status,
            assignedToId: row.assigned_to_id ?? null,
            createdAt: row.created_at,
            notes: row.notes ?? null,
            requestedDoneAt: row.requested_done_at ?? null,
            updatedAt: row.updated_at,
            validatedAt: row.validated_at ?? null,
            validatedById: row.validated_by_id ?? null,
            jobRole: row.job_role ?? null,
            checkedAt: row.checked_at ?? null,
            checkedById: row.checked_by_id ?? null,
            isChecked: !!row.is_checked,
            order: mappedOrder,
            assignedTo: row.account_ordertask_assigned_to_idToaccount || null,
            validatedBy: row.account_ordertask_validated_by_idToaccount || null,
        };
    }
    async backfillActive() {
        const activeStatuses = ['MENUNGGU', 'DALAM_PROSES'];
        const orders = await this.prisma.order.findMany({ where: { status: { in: activeStatuses } }, select: { id: true } });
        if (!orders.length)
            return { created: 0 };
        const missing = [];
        for (const o of orders) {
            const c = await this.prisma.ordertask.count({ where: { orderId: o.id } });
            if (c === 0)
                missing.push(o.id);
        }
        if (!missing.length)
            return { created: 0 };
        await this.prisma.$transaction(missing.map(id => this.prisma.ordertask.create({ data: { orderId: id, stage: 'Awal', status: 'OPEN', updated_at: new Date() } })));
        return { created: missing.length };
    }
    listActive() {
        return (async () => {
            const rows = await this.prisma.ordertask.findMany({
                where: {
                    status: { not: task_dtos_1.TaskStatus.DONE },
                    order: { status: { in: ['MENUNGGU', 'DALAM_PROSES'] } },
                },
                orderBy: { created_at: 'desc' },
                include: {
                    order: { select: {
                            id: true, code: true, status: true,
                            customer_name: true, customer_phone: true, customer_address: true,
                            item_type: true, gold_type: true, gold_color: true, ring_size: true,
                            created_at: true, promised_ready_date: true, completed_date: true, pickup_date: true,
                            notes: true, reference_image_urls: true
                        } },
                    account_ordertask_assigned_to_idToaccount: { select: { id: true, fullName: true, job_role: true } },
                    account_ordertask_validated_by_idToaccount: { select: { id: true, fullName: true, job_role: true } },
                },
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
                    r.is_checked = !!c.is_checked; });
            }
            catch { }
            return rows.map((r) => this.mapTask(r));
        })();
    }
    async listByOrder(orderId) {
        const rows = await this.prisma.ordertask.findMany({
            where: { orderId: Number(orderId) },
            orderBy: { created_at: 'asc' },
            include: {
                account_ordertask_assigned_to_idToaccount: { select: { id: true, fullName: true, job_role: true } },
            },
        });
        if (!rows.length)
            return rows;
        try {
            const sql = `SELECT id, is_checked FROM OrderTask WHERE orderId = ?`;
            const checks = await this.prisma.$queryRawUnsafe(sql, Number(orderId));
            const map = new Map();
            checks.forEach((c) => map.set(Number(c.id), c));
            rows.forEach((r) => { const c = map.get(Number(r.id)); if (c)
                r.is_checked = !!c.is_checked; });
        }
        catch { }
        return rows.map((r) => this.mapTask(r));
    }
    async listAwaitingValidationByOrder(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const rows = await this.prisma.ordertask.findMany({
            where: { orderId, status: task_dtos_1.TaskStatus.AWAITING_VALIDATION },
            orderBy: { created_at: 'desc' },
            include: {
                account_ordertask_assigned_to_idToaccount: { select: { id: true, fullName: true, job_role: true } },
            },
        });
        return rows.map((r) => this.mapTask(r));
    }
    async create(data) {
        const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const created = await this.prisma.ordertask.create({
            data: {
                orderId: data.orderId,
                stage: data.stage,
                notes: data.notes,
                status: task_dtos_1.TaskStatus.OPEN,
                updated_at: new Date(),
            },
            include: { order: true },
        });
        return this.mapTask(created);
    }
    async update(id, patch) {
        const exists = await this.prisma.ordertask.findUnique({ where: { id }, include: { order: true } });
        if (!exists)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(exists.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const data = { updated_at: new Date() };
        if (patch.stage !== undefined)
            data.stage = patch.stage;
        if (patch.notes !== undefined)
            data.notes = patch.notes;
        if (patch.status !== undefined)
            data.status = patch.status;
        if (patch.assignedToId !== undefined)
            data.assigned_to_id = patch.assignedToId;
        const updated = await this.prisma.ordertask.update({ where: { id }, data });
        return this.mapTask(updated);
    }
    async remove(id) {
        const exists = await this.prisma.ordertask.findUnique({ where: { id }, include: { order: true } });
        if (!exists)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(exists.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        await this.prisma.ordertask.delete({ where: { id } });
        return { success: true };
    }
    async assign(id, assignedToId, actorUserId) {
        const task = await this.prisma.ordertask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const ops = [];
        if (task.order && task.order.status === 'MENUNGGU') {
            ops.push(this.prisma.order.update({ where: { id: task.orderId }, data: { status: 'DALAM_PROSES' } }));
            try {
                const actor = await this.prisma.account.findUnique({ where: { id: assignedToId }, select: { fullName: true, job_role: true } });
                ops.push(this.prisma.orderhistory.create({
                    data: ({
                        orderId: task.orderId,
                        userId: actorUserId ?? assignedToId,
                        action: 'STATUS_CHANGED',
                        actorName: actor?.fullName ?? null,
                        actorRole: actor?.job_role ?? null,
                        statusFrom: 'MENUNGGU',
                        statusTo: 'DALAM_PROSES',
                        orderCode: task.order?.code ?? null,
                        changeSummary: 'STATUS: MENUNGGU -> DALAM_PROSES',
                        diff: JSON.stringify({ from: 'MENUNGGU', to: 'DALAM_PROSES' }),
                    }),
                }));
            }
            catch { }
        }
        ops.push(this.prisma.ordertask.update({ where: { id }, data: { assigned_to_id: assignedToId, status: task_dtos_1.TaskStatus.ASSIGNED, updated_at: new Date() } }));
        const txResult = await this.prisma.$transaction(ops);
        return this.mapTask(txResult[txResult.length - 1]);
    }
    async assignBulk(params) {
        const order = await this.prisma.order.findUnique({ where: { id: params.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const user = await this.prisma.account.findUnique({ where: { id: params.userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const blockingStatuses = ['ASSIGNED', 'IN_PROGRESS', 'AWAITING_VALIDATION'];
        const existingActive = await this.prisma.ordertask.findMany({
            where: { orderId: params.orderId, status: { in: blockingStatuses }, assigned_to_id: { not: null } },
            include: { account_ordertask_assigned_to_idToaccount: true },
        });
        if (existingActive && existingActive.length > 0) {
            const names = Array.from(new Set(existingActive.map((t) => t.account_ordertask_assigned_to_idToaccount?.fullName || t.assigned_to_id))).filter(Boolean);
            const who = names.length ? ` (${names.join(', ')})` : '';
            throw new common_1.BadRequestException(`Pesanan sedang dikerjakan${who}. Tidak bisa assign lagi sebelum verifikasi disetujui.`);
        }
        const creates = params.subtasks.map(st => this.prisma.ordertask.create({
            data: {
                orderId: params.orderId,
                stage: st.stage,
                notes: st.notes,
                assigned_to_id: params.userId,
                job_role: params.role,
                status: task_dtos_1.TaskStatus.ASSIGNED,
                updated_at: new Date(),
            },
        }));
        const updates = [...creates];
        if (order.status === 'MENUNGGU') {
            updates.push(this.prisma.order.update({ where: { id: params.orderId }, data: { status: 'DALAM_PROSES' } }));
            try {
                const actor = await this.prisma.account.findUnique({ where: { id: params.actorUserId || params.userId }, select: { fullName: true, job_role: true } });
                updates.push(this.prisma.orderhistory.create({
                    data: ({
                        orderId: params.orderId,
                        userId: params.actorUserId || params.userId,
                        action: 'STATUS_CHANGED',
                        actorName: actor?.fullName ?? null,
                        actorRole: actor?.job_role ?? null,
                        statusFrom: 'MENUNGGU',
                        statusTo: 'DALAM_PROSES',
                        orderCode: order.code ?? null,
                        changeSummary: 'STATUS: MENUNGGU -> DALAM_PROSES',
                        diff: JSON.stringify({ from: 'MENUNGGU', to: 'DALAM_PROSES' }),
                    }),
                }));
            }
            catch { }
        }
        await this.prisma.$transaction(updates);
        return { created: creates.length };
    }
    async requestDone(id, requesterUserId, notes) {
        this.logger.debug(`requestDone id=${id} by=${requesterUserId}`);
        const task = await this.prisma.ordertask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        if (task.assigned_to_id && task.assigned_to_id !== requesterUserId)
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
            const res = await this.prisma.ordertask.update({ where: { id }, data: { notes: notes ?? task.notes, requested_done_at: new Date(), status: task_dtos_1.TaskStatus.AWAITING_VALIDATION, updated_at: new Date() } });
            try {
                const actor = await this.prisma.account.findUnique({ where: { id: requesterUserId }, select: { fullName: true, job_role: true } });
                await this.prisma.orderhistory.create({
                    data: ({
                        orderId: task.orderId,
                        userId: requesterUserId,
                        action: 'TASK_EVENT',
                        actorName: actor?.fullName ?? null,
                        actorRole: actor?.job_role ?? null,
                        orderCode: task.order?.code ?? null,
                        changeSummary: `TASK_REQUESTED_VALIDATION (task#${id})`,
                        diff: JSON.stringify({ taskId: id, event: 'REQUEST_VALIDATION', notes: notes ?? null }),
                    }),
                });
            }
            catch { }
            this.logger.debug(`requestDone OK id=${id}`);
            return this.mapTask(res);
        }
        catch (e) {
            this.logger.error(`requestDone FAIL id=${id} by=${requesterUserId}: ${e?.message}`, e?.stack);
            throw new common_1.BadRequestException(e?.message || 'Gagal mengajukan verifikasi');
        }
    }
    async validateDone(id, validatorUserId, notes) {
        const task = await this.prisma.ordertask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const updated = await this.prisma.ordertask.update({ where: { id }, data: { validated_by_id: validatorUserId, validated_at: new Date(), notes: notes ?? task.notes, status: task_dtos_1.TaskStatus.DONE, updated_at: new Date() } });
        try {
            const actor = await this.prisma.account.findUnique({ where: { id: validatorUserId }, select: { fullName: true, job_role: true } });
            await this.prisma.orderhistory.create({
                data: ({
                    orderId: task.orderId,
                    userId: validatorUserId,
                    action: 'TASK_EVENT',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.job_role ?? null,
                    orderCode: task.order?.code ?? null,
                    changeSummary: `TASK_VALIDATED (task#${id})`,
                    diff: JSON.stringify({ taskId: id, event: 'TASK_VALIDATED', notes: notes ?? null }),
                }),
            });
        }
        catch { }
        return this.mapTask(updated);
    }
    async validateAllForOrderAndUser(orderId, targetUserId, validatorUserId, notes) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const tasks = await this.prisma.ordertask.findMany({
            where: { orderId, assigned_to_id: targetUserId, status: task_dtos_1.TaskStatus.AWAITING_VALIDATION },
            select: { id: true },
        });
        if (!tasks.length)
            return { updated: 0 };
        const ops = tasks.map(t => this.prisma.ordertask.update({
            where: { id: t.id },
            data: { validated_by_id: validatorUserId, validated_at: new Date(), notes, status: task_dtos_1.TaskStatus.DONE, updated_at: new Date() },
        }));
        await this.prisma.$transaction(ops);
        try {
            const actor = await this.prisma.account.findUnique({ where: { id: validatorUserId }, select: { fullName: true, job_role: true } });
            await this.prisma.orderhistory.create({
                data: ({
                    orderId,
                    userId: validatorUserId,
                    action: 'TASK_EVENT',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.job_role ?? null,
                    orderCode: order.code ?? null,
                    changeSummary: `TASKS_VALIDATED user=${targetUserId}`,
                    diff: JSON.stringify({ userId: targetUserId, event: 'TASKS_VALIDATED', count: tasks.length, notes: notes ?? null }),
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
            const updates = ids.map(id => this.prisma.ordertask.update({ where: { id }, data: { notes, requested_done_at: new Date(), status: task_dtos_1.TaskStatus.AWAITING_VALIDATION, updated_at: new Date() } }));
            await this.prisma.$transaction(updates);
            try {
                const actor = await this.prisma.account.findUnique({ where: { id: requesterUserId }, select: { fullName: true, job_role: true } });
                await this.prisma.orderhistory.create({
                    data: ({
                        orderId,
                        userId: requesterUserId,
                        action: 'TASK_EVENT',
                        actorName: actor?.fullName ?? null,
                        actorRole: actor?.job_role ?? null,
                        orderCode: order.code ?? null,
                        changeSummary: `TASKS_REQUESTED_VALIDATION user=${requesterUserId}`,
                        diff: JSON.stringify({ userId: requesterUserId, event: 'REQUEST_VALIDATION_BULK', count: ids.length, notes: notes ?? null }),
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
        const task = await this.prisma.ordertask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        if (task.assigned_to_id && task.assigned_to_id !== actorUserId)
            throw new common_1.BadRequestException('Hanya yang ditugaskan yang bisa mengubah checklist');
        if (task.status === task_dtos_1.TaskStatus.AWAITING_VALIDATION || task.status === task_dtos_1.TaskStatus.DONE) {
            throw new common_1.BadRequestException('Checklist tidak bisa diubah setelah request selesai diajukan atau divalidasi');
        }
        if (task.status === task_dtos_1.TaskStatus.ASSIGNED && value) {
            throw new common_1.BadRequestException('Mohon terima pesanan terlebih dahulu untuk memulai.');
        }
        const checkedVal = value ? 1 : 0;
        await this.prisma.$executeRaw `UPDATE OrderTask SET is_checked = ${checkedVal}, checked_at = ${value ? new Date() : null}, checked_by_id = ${value ? actorUserId : null} WHERE id = ${Number(id)}`;
        const updated = await this.prisma.ordertask.findUnique({ where: { id } });
        return this.mapTask({ ...updated, is_checked: !!value });
    }
    async start(id, actorUserId) {
        this.logger.debug(`start id=${id} by=${actorUserId}`);
        const task = await this.prisma.ordertask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        if (task.status !== task_dtos_1.TaskStatus.ASSIGNED)
            throw new common_1.BadRequestException('Hanya task ASSIGNED yang bisa dimulai');
        if (task.assigned_to_id && task.assigned_to_id !== actorUserId)
            throw new common_1.BadRequestException('Hanya yang ditugaskan yang bisa memulai');
        const ops = [];
        if (task.order && task.order.status === 'MENUNGGU') {
            const actor = await this.prisma.account.findUnique({ where: { id: actorUserId }, select: { fullName: true, job_role: true } });
            ops.push(this.prisma.order.update({ where: { id: task.orderId }, data: { status: 'DALAM_PROSES' } }));
            ops.push(this.prisma.orderhistory.create({
                data: ({
                    orderId: task.orderId,
                    userId: actorUserId,
                    action: 'STATUS_CHANGED',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.job_role ?? null,
                    statusFrom: task.order.status,
                    statusTo: 'DALAM_PROSES',
                    orderCode: task.order?.code ?? null,
                    changeSummary: `STATUS: ${task.order.status} -> DALAM_PROSES`,
                    diff: { from: task.order.status, to: 'DALAM_PROSES' },
                }),
            }));
        }
        ops.push(this.prisma.ordertask.update({ where: { id }, data: { status: task_dtos_1.TaskStatus.IN_PROGRESS, updated_at: new Date() } }));
        const res = await this.prisma.$transaction(ops);
        return this.mapTask(res[res.length - 1]);
    }
    async acceptOrderForUser(orderId, actorUserId) {
        this.logger.debug(`acceptOrderForUser order=${orderId} by=${actorUserId}`);
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!this.isOrderActive(order.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        const tasks = await this.prisma.ordertask.findMany({
            where: { orderId, assigned_to_id: actorUserId, status: task_dtos_1.TaskStatus.ASSIGNED },
            select: { id: true },
        });
        if (!tasks.length)
            throw new common_1.BadRequestException('Tidak ada tugas ASSIGNED untuk diterima');
        const ops = tasks.map(t => this.prisma.ordertask.update({ where: { id: t.id }, data: { status: task_dtos_1.TaskStatus.IN_PROGRESS, updated_at: new Date() } }));
        if (order.status === 'MENUNGGU') {
            const actor = await this.prisma.account.findUnique({ where: { id: actorUserId }, select: { fullName: true, job_role: true } });
            ops.unshift(this.prisma.order.update({ where: { id: orderId }, data: { status: 'DALAM_PROSES' } }));
            ops.unshift(this.prisma.orderhistory.create({
                data: ({
                    orderId,
                    userId: actorUserId,
                    action: 'STATUS_CHANGED',
                    actorName: actor?.fullName ?? null,
                    actorRole: actor?.job_role ?? null,
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
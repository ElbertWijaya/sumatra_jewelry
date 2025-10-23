import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '../types/task.dtos';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private prisma: PrismaService) {}

  private isOrderActive(status: string | null | undefined) {
    // Active statuses: DRAFT, DITERIMA, DALAM_PROSES
    return status === 'DRAFT' || status === 'DITERIMA' || status === 'DALAM_PROSES';
  }

  async backfillActive() {
    // Create OPEN tasks for all active orders that currently have no tasks
    const activeStatuses = ['DRAFT','DITERIMA','DALAM_PROSES'];
    const orders = await this.prisma.order.findMany({ where: { status: { in: activeStatuses as any } }, select: { id: true } });
    if (!orders.length) return { created: 0 };
    const missing: number[] = [];
    for (const o of orders) {
      const c = await (this.prisma as any).orderTask.count({ where: { orderId: o.id } });
      if (c === 0) missing.push(o.id);
    }
    if (!missing.length) return { created: 0 };
    await this.prisma.$transaction(
      missing.map(id => (this.prisma as any).orderTask.create({ data: { orderId: id, stage: 'Awal', status: 'OPEN' } }))
    );
    return { created: missing.length };
  }
  listActive() {
    return (async () => {
      const rows = await (this.prisma as any).orderTask.findMany({
        where: {
          status: { not: TaskStatus.DONE as any },
          order: { status: { in: ['DRAFT','DITERIMA','DALAM_PROSES'] } },
        },
        orderBy: { createdAt: 'desc' },
        include: { order: true, assignedTo: true, validatedBy: true },
      });
      if (!rows.length) return rows;
      const ids = rows.map((r: any) => r.id);
      try {
        if (!ids.length) return rows;
        // Build an IN (...) list safely
        const fragments = ids.map(() => `?`).join(',');
        const sql = `SELECT id, is_checked FROM OrderTask WHERE id IN (${fragments})`;
        const checks: any[] = await (this.prisma as any).$queryRawUnsafe(sql, ...ids);
        const map = new Map<number, any>();
        checks.forEach((c: any) => map.set(Number(c.id), c));
        rows.forEach((r: any) => { const c = map.get(Number(r.id)); if (c) (r as any).isChecked = !!c.is_checked; });
      } catch {}
      return rows;
    })();
  }

  async listByOrder(orderId: number) {
    const rows = await (this.prisma as any).orderTask.findMany({
      where: { orderId: Number(orderId) },
      orderBy: { createdAt: 'asc' },
      include: { assignedTo: true },
    });
    if (!rows.length) return rows;
    try {
      const sql = `SELECT id, is_checked FROM OrderTask WHERE orderId = ?`;
      const checks: any[] = await (this.prisma as any).$queryRawUnsafe(sql, Number(orderId));
      const map = new Map<number, any>();
      checks.forEach((c: any) => map.set(Number(c.id), c));
      rows.forEach((r: any) => { const c = map.get(Number(r.id)); if (c) (r as any).isChecked = !!c.is_checked; });
    } catch {}
    return rows;
  }
  async listAwaitingValidationByOrder(orderId: number) {
    // Only tasks for this order that are awaiting validation
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return (this.prisma as any).orderTask.findMany({
      where: { orderId, status: TaskStatus.AWAITING_VALIDATION as any },
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: true }
    });
  }

  async create(data: { orderId: number; stage?: string; notes?: string }) {
    // ensure order exists
  const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundException('Order not found');
  if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');
  return (this.prisma as any).orderTask.create({ data: { orderId: data.orderId, stage: data.stage, notes: data.notes, status: TaskStatus.OPEN as any } });
  }

  async update(id: number, patch: { stage?: string; notes?: string; status?: TaskStatus; assignedToId?: string | null }) {
  const exists = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!exists) throw new NotFoundException('Task not found');
  if (!this.isOrderActive(exists.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
  return (this.prisma as any).orderTask.update({ where: { id }, data: { ...patch } as any });
  }

  async remove(id: number) {
  const exists = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
  if (!exists) throw new NotFoundException('Task not found');
  if (!this.isOrderActive(exists.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
  await (this.prisma as any).orderTask.delete({ where: { id } });
    return { success: true };
  }

  async assign(id: number, assignedToId: string, actorUserId?: string) {
  const task = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
  if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
  // Assignment should not auto-jump to DALAM_PROSES.
  // If order is DRAFT, mark as DITERIMA to indicate it has been taken into workflow.
  const ops: any[] = [];
  if (task.order && task.order.status === 'DRAFT') {
  const actor = actorUserId ? await this.prisma.account.findUnique({ where: { id: actorUserId }, select: { fullName: true, job_role: true } }) : null;
    ops.push(this.prisma.order.update({ where: { id: task.orderId }, data: { status: 'DITERIMA' as any } }));
    ops.push((this.prisma as any).orderHistory.create({
      data: ({
        orderId: task.orderId,
        userId: actorUserId ?? null,
        action: 'STATUS_CHANGED',
        actorName: actor?.fullName ?? null,
        actorRole: (actor as any)?.jobRole ?? null,
        statusFrom: 'DRAFT',
        statusTo: 'DITERIMA',
        orderCode: task.order?.code ?? null,
        changeSummary: `STATUS: DRAFT -> DITERIMA`,
        diff: { from: 'DRAFT', to: 'DITERIMA' },
      }) as any,
    }));
  }
  ops.push((this.prisma as any).orderTask.update({ where: { id }, data: { assignedToId, status: TaskStatus.ASSIGNED as any } }));
  const txResult = await this.prisma.$transaction(ops);
  // realtime disabled
  // Return the task update result (last op)
  return txResult[txResult.length - 1];
  }

  async assignBulk(params: { orderId: number; role: 'DESIGNER'|'CASTER'|'CARVER'|'DIAMOND_SETTER'|'FINISHER'|'INVENTORY'; userId: string; subtasks: { stage?: string; notes?: string }[]; actorUserId?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: params.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');

  const user = await this.prisma.account.findUnique({ where: { id: params.userId } });
    if (!user) throw new NotFoundException('User not found');

    // Business rule: block new assignment if the order already has any active tasks (assigned/in_progress/awaiting_validation)
    const blockingStatuses = ['ASSIGNED','IN_PROGRESS','AWAITING_VALIDATION'];
    const existingActive = await (this.prisma as any).orderTask.findMany({
      where: { orderId: params.orderId, status: { in: blockingStatuses as any }, assignedToId: { not: null } },
      include: { assignedTo: true },
    });
    if (existingActive && existingActive.length > 0) {
      const names = Array.from(new Set(existingActive.map((t:any)=> t.assignedTo?.fullName || t.assignedToId))).filter(Boolean);
      const who = names.length ? ` (${names.join(', ')})` : '';
      throw new BadRequestException(`Pesanan sedang dikerjakan${who}. Tidak bisa assign lagi sebelum verifikasi disetujui.`);
    }

    // Create multiple tasks with given stages/notes, assigned to the selected user
    const creates = params.subtasks.map(st => (this.prisma as any).orderTask.create({
      data: {
        orderId: params.orderId,
        stage: st.stage,
        notes: st.notes,
        assignedToId: params.userId,
        jobRole: params.role as any,
        status: TaskStatus.ASSIGNED as any,
      },
    }));
    // If assigning while DRAFT, update to DITERIMA (do not auto DALAM_PROSES here)
    const updates: any[] = [];
    if (order.status === 'DRAFT') {
  const actor = params.actorUserId ? await this.prisma.account.findUnique({ where: { id: params.actorUserId }, select: { fullName: true, job_role: true } }) : null;
      updates.push(this.prisma.order.update({ where: { id: params.orderId }, data: { status: 'DITERIMA' as any } }));
      updates.push((this.prisma as any).orderHistory.create({
        data: ({
          orderId: params.orderId,
          userId: params.actorUserId ?? null,
          action: 'STATUS_CHANGED',
          actorName: actor?.fullName ?? null,
          actorRole: (actor as any)?.jobRole ?? null,
          statusFrom: 'DRAFT',
          statusTo: 'DITERIMA',
          orderCode: order.code ?? null,
          changeSummary: `STATUS: DRAFT -> DITERIMA`,
          diff: { from: 'DRAFT', to: 'DITERIMA' },
        }) as any,
      }));
    }
    updates.push(...creates);
  await this.prisma.$transaction(updates);
  // realtime disabled
    return { created: creates.length };
  }

  async requestDone(id: number, requesterUserId: string, notes?: string) {
  this.logger.debug(`requestDone id=${id} by=${requesterUserId}`);
    const task = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    if (task.assignedToId && task.assignedToId !== requesterUserId) throw new BadRequestException('Hanya yang ditugaskan yang bisa request selesai');

    // Enforce: task must be IN_PROGRESS and already checked
    const selfCheck: any[] = await this.prisma.$queryRaw`SELECT is_checked FROM OrderTask WHERE id = ${Number(id)} LIMIT 1`;
    const isSelfChecked = !!(selfCheck?.[0]?.is_checked);
    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new BadRequestException('Task harus dalam status IN_PROGRESS untuk request selesai');
    }
    if (!isSelfChecked) {
      throw new BadRequestException('Checklist wajib dicentang sebelum request selesai');
    }

    // Enforce: all tasks for the same order assigned to this user must be checked and not left in ASSIGNED
  const rows: any[] = await this.prisma.$queryRaw`SELECT id, status, is_checked FROM OrderTask WHERE orderId = ${Number(task.orderId)} AND assigned_to_id = ${requesterUserId} AND status IN ('ASSIGNED','IN_PROGRESS')`;
    const hasUnstarted = rows.some(r => String(r.status) === 'ASSIGNED');
    if (hasUnstarted) {
      throw new BadRequestException('Ada sub-tugas yang belum dimulai/di-checklist. Mohon checklist semua dulu.');
    }
    const anyUnchecked = rows.some(r => String(r.status) === 'IN_PROGRESS' && !r.is_checked);
    if (anyUnchecked) {
      throw new BadRequestException('Semua sub-tugas harus dichecklist sebelum bisa request selesai.');
    }

    try {
      const res = await (this.prisma as any).orderTask.update({ where: { id }, data: { notes: notes ?? task.notes, requestedDoneAt: new Date(), status: TaskStatus.AWAITING_VALIDATION as any } });
      // Log history: request validation
      try {
  const actor = await this.prisma.account.findUnique({ where: { id: requesterUserId }, select: { fullName: true, job_role: true } });
        await (this.prisma as any).orderHistory.create({
          data: ({
            orderId: task.orderId,
            userId: requesterUserId,
            action: 'TASK_EVENT',
            actorName: actor?.fullName ?? null,
            actorRole: (actor as any)?.jobRole ?? null,
            orderCode: task.order?.code ?? null,
            changeSummary: `TASK_REQUESTED_VALIDATION (task#${id})`,
            diff: { taskId: id, event: 'REQUEST_VALIDATION', notes: notes ?? null },
          }) as any,
        });
      } catch {}
      this.logger.debug(`requestDone OK id=${id}`);
      return res;
    } catch (e: any) {
      this.logger.error(`requestDone FAIL id=${id} by=${requesterUserId}: ${e?.message}`, e?.stack);
      throw new BadRequestException(e?.message || 'Gagal mengajukan verifikasi');
    }
  }

  async validateDone(id: number, validatorUserId: string, notes?: string) {
  const task = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
  if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
  const updated = await (this.prisma as any).orderTask.update({ where: { id }, data: { validatedById: validatorUserId, validatedAt: new Date(), notes: notes ?? task.notes, status: TaskStatus.DONE as any } });
  // Log history: task validated
  try {
  const actor = await this.prisma.account.findUnique({ where: { id: validatorUserId }, select: { fullName: true, job_role: true } });
    await (this.prisma as any).orderHistory.create({
      data: ({
        orderId: task.orderId,
        userId: validatorUserId,
        action: 'TASK_EVENT',
        actorName: actor?.fullName ?? null,
        actorRole: (actor as any)?.jobRole ?? null,
        orderCode: task.order?.code ?? null,
        changeSummary: `TASK_VALIDATED (task#${id})`,
        diff: { taskId: id, event: 'TASK_VALIDATED', notes: notes ?? null },
      }) as any,
    });
  } catch {}
  return updated;
  }

  async validateAllForOrderAndUser(orderId: number, targetUserId: string, validatorUserId: string, notes?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');

    const tasks: any[] = await (this.prisma as any).orderTask.findMany({
      where: { orderId, assignedToId: targetUserId, status: TaskStatus.AWAITING_VALIDATION as any },
      select: { id: true },
    });
    if (!tasks.length) return { updated: 0 };

    const ops = tasks.map(t => (this.prisma as any).orderTask.update({
      where: { id: t.id },
      data: { validatedById: validatorUserId, validatedAt: new Date(), notes, status: TaskStatus.DONE as any },
    }));
    await this.prisma.$transaction(ops);
    // Log history: bulk validated
    try {
  const actor = await this.prisma.account.findUnique({ where: { id: validatorUserId }, select: { fullName: true, job_role: true } });
      await (this.prisma as any).orderHistory.create({
        data: ({
          orderId,
          userId: validatorUserId,
          action: 'TASK_EVENT',
          actorName: actor?.fullName ?? null,
          actorRole: (actor as any)?.jobRole ?? null,
          orderCode: order.code ?? null,
          changeSummary: `TASKS_VALIDATED user=${targetUserId}`,
          diff: { userId: targetUserId, event: 'TASKS_VALIDATED', count: tasks.length, notes: notes ?? null },
        }) as any,
      });
    } catch {}
    return { updated: tasks.length };
  }

  async requestDoneForOrderForUser(orderId: number, requesterUserId: string, notes?: string) {
  this.logger.debug(`requestDoneForOrderForUser order=${orderId} by=${requesterUserId}`);
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');

    // Get all tasks for this order assigned to the user that are ASSIGNED/IN_PROGRESS
  const rows: any[] = await this.prisma.$queryRaw`SELECT id, status, is_checked FROM OrderTask WHERE orderId = ${Number(orderId)} AND assigned_to_id = ${requesterUserId} AND status IN ('ASSIGNED','IN_PROGRESS')`;
    if (rows.length === 0) throw new BadRequestException('Tidak ada tugas yang bisa diajukan');
    if (rows.some(r => String(r.status) === 'ASSIGNED')) throw new BadRequestException('Ada sub-tugas yang belum dimulai. Checklist untuk memulai.');
    if (rows.some(r => String(r.status) === 'IN_PROGRESS' && !r.is_checked)) throw new BadRequestException('Semua sub-tugas harus dichecklist dulu.');

    // Update all IN_PROGRESS tasks to AWAITING_VALIDATION in one transaction
    const ids = rows.filter(r => String(r.status) === 'IN_PROGRESS').map(r => Number(r.id));
    if (!ids.length) return { updated: 0 };
    try {
      const updates = ids.map(id => (this.prisma as any).orderTask.update({ where: { id }, data: { notes, requestedDoneAt: new Date(), status: TaskStatus.AWAITING_VALIDATION as any } }));
      await this.prisma.$transaction(updates);
      // Log history: bulk request validation
      try {
  const actor = await this.prisma.account.findUnique({ where: { id: requesterUserId }, select: { fullName: true, job_role: true } });
        await (this.prisma as any).orderHistory.create({
          data: ({
            orderId,
            userId: requesterUserId,
            action: 'TASK_EVENT',
            actorName: actor?.fullName ?? null,
            actorRole: (actor as any)?.jobRole ?? null,
            orderCode: order.code ?? null,
            changeSummary: `TASKS_REQUESTED_VALIDATION user=${requesterUserId}`,
            diff: { userId: requesterUserId, event: 'REQUEST_VALIDATION_BULK', count: ids.length, notes: notes ?? null },
          }) as any,
        });
      } catch {}
      this.logger.debug(`requestDoneForOrderForUser OK order=${orderId} updated=${ids.length}`);
      return { updated: ids.length };
    } catch (e: any) {
      this.logger.error(`requestDoneForOrderForUser FAIL order=${orderId} by=${requesterUserId}: ${e?.message}`, e?.stack);
      throw new BadRequestException(e?.message || 'Gagal mengajukan verifikasi');
    }
  }

  async setChecked(id: number, actorUserId: string, value: boolean) {
  this.logger.debug(`setChecked id=${id} by=${actorUserId} value=${value}`);
    const task = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    if (task.assignedToId && task.assignedToId !== actorUserId) throw new BadRequestException('Hanya yang ditugaskan yang bisa mengubah checklist');
    if (task.status === TaskStatus.AWAITING_VALIDATION || task.status === TaskStatus.DONE) {
      throw new BadRequestException('Checklist tidak bisa diubah setelah request selesai diajukan atau divalidasi');
    }

    // New rule: cannot check while ASSIGNED; must explicitly accept first
    if (task.status === TaskStatus.ASSIGNED && value) {
      throw new BadRequestException('Mohon terima pesanan terlebih dahulu untuk memulai.');
    }

    const checkedVal = value ? 1 : 0;
    await this.prisma.$executeRaw`UPDATE OrderTask SET is_checked = ${checkedVal}, checked_at = ${value ? new Date() : null}, checked_by_id = ${value ? actorUserId : null} WHERE id = ${Number(id)}`;
    const updated = await (this.prisma as any).orderTask.findUnique({ where: { id } });
    return { ...updated, isChecked: !!value } as any;
  }

  async start(id: number, actorUserId: string) {
  this.logger.debug(`start id=${id} by=${actorUserId}`);
    const task = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    if (task.status !== TaskStatus.ASSIGNED) throw new BadRequestException('Hanya task ASSIGNED yang bisa dimulai');
    if (task.assignedToId && task.assignedToId !== actorUserId) throw new BadRequestException('Hanya yang ditugaskan yang bisa memulai');
    const ops: any[] = [];
    // On first start, move order into DALAM_PROSES if currently DRAFT/DITERIMA
    if (task.order && (task.order.status === 'DRAFT' || task.order.status === 'DITERIMA')) {
  const actor = await this.prisma.account.findUnique({ where: { id: actorUserId }, select: { fullName: true, job_role: true } });
      ops.push(this.prisma.order.update({ where: { id: task.orderId }, data: { status: 'DALAM_PROSES' as any } }));
      ops.push((this.prisma as any).orderHistory.create({
        data: ({
          orderId: task.orderId,
          userId: actorUserId,
          action: 'STATUS_CHANGED',
          actorName: actor?.fullName ?? null,
          actorRole: (actor as any)?.jobRole ?? null,
          statusFrom: task.order.status,
          statusTo: 'DALAM_PROSES',
          orderCode: task.order?.code ?? null,
          changeSummary: `STATUS: ${task.order.status} -> DALAM_PROSES`,
          diff: { from: task.order.status, to: 'DALAM_PROSES' },
        }) as any,
      }));
    }
    ops.push((this.prisma as any).orderTask.update({ where: { id }, data: { status: TaskStatus.IN_PROGRESS as any } }));
    const res = await this.prisma.$transaction(ops);
    return res[res.length - 1];
  }

  async acceptOrderForUser(orderId: number, actorUserId: string) {
    this.logger.debug(`acceptOrderForUser order=${orderId} by=${actorUserId}`);
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');

    const tasks: any[] = await (this.prisma as any).orderTask.findMany({
      where: { orderId, assignedToId: actorUserId, status: TaskStatus.ASSIGNED as any },
      select: { id: true },
    });
    if (!tasks.length) throw new BadRequestException('Tidak ada tugas ASSIGNED untuk diterima');

    const ops: any[] = tasks.map(t => (this.prisma as any).orderTask.update({ where: { id: t.id }, data: { status: TaskStatus.IN_PROGRESS as any } }));
    // Move order into DALAM_PROSES if currently DRAFT/DITERIMA
    if (order.status === 'DRAFT' || order.status === 'DITERIMA') {
  const actor = await this.prisma.account.findUnique({ where: { id: actorUserId }, select: { fullName: true, job_role: true } });
      ops.unshift(this.prisma.order.update({ where: { id: orderId }, data: { status: 'DALAM_PROSES' as any } }));
      ops.unshift((this.prisma as any).orderHistory.create({
        data: ({
          orderId,
          userId: actorUserId,
          action: 'STATUS_CHANGED',
          actorName: actor?.fullName ?? null,
          actorRole: (actor as any)?.jobRole ?? null,
          statusFrom: order.status,
          statusTo: 'DALAM_PROSES',
          orderCode: order.code ?? null,
          changeSummary: `STATUS: ${order.status} -> DALAM_PROSES`,
          diff: { from: order.status, to: 'DALAM_PROSES' },
        }) as any,
      }));
    }
    await this.prisma.$transaction(ops);
    return { accepted: tasks.length };
  }
}

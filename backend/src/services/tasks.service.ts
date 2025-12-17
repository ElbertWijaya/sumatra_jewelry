import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '../types/task.dtos';
import { PushService } from './push.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private prisma: PrismaService, private push: PushService) {}

  private isOrderActive(status: string | null | undefined) {
    return status === 'MENUNGGU' || status === 'DALAM_PROSES';
  }

  private mapTask(row: any) {
    if (!row) return row;
    const o = row.order;
    const mappedOrder = o ? {
      id: o.id,
      code: o.code ?? null,
      status: o.status ?? null,
      // customer
      customerName: o.customer_name ?? null,
      customer_name: o.customer_name ?? null,
      customerPhone: o.customer_phone ?? null,
      customer_phone: o.customer_phone ?? null,
      customerAddress: o.customer_address ?? null,
      customer_address: o.customer_address ?? null,
      // item / gold
      jenisBarang: o.item_type ?? null,
      item_type: o.item_type ?? null,
      jenisEmas: o.gold_type ?? null,
      gold_type: o.gold_type ?? null,
      warnaEmas: o.gold_color ?? null,
      gold_color: o.gold_color ?? null,
      ringSize: o.ring_size ?? null,
      ring_size: o.ring_size ?? null,
      // dates
      createdAt: o.created_at ?? null,
      created_at: o.created_at ?? null,
      promisedReadyDate: o.promised_ready_date ?? null,
      promised_ready_date: o.promised_ready_date ?? null,
      tanggalSelesai: o.completed_date ?? null,
      completed_date: o.completed_date ?? null,
      tanggalAmbil: o.pickup_date ?? null,
      pickup_date: o.pickup_date ?? null,
      // misc
      catatan: o.notes ?? null,
      notes: o.notes ?? null,
      referensiGambarUrls: o.reference_image_urls ? (() => { try { return JSON.parse(o.reference_image_urls); } catch { return []; } })() : [],
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
    // Create OPEN tasks for all active orders that currently have no tasks
    const activeStatuses = ['MENUNGGU','DALAM_PROSES'];
    const orders = await this.prisma.order.findMany({ where: { status: { in: activeStatuses as any } }, select: { id: true } });
    if (!orders.length) return { created: 0 };
    const missing: number[] = [];
    for (const o of orders) {
      const c = await (this.prisma as any).ordertask.count({ where: { orderId: o.id } });
      if (c === 0) missing.push(o.id);
    }
    if (!missing.length) return { created: 0 };
    await this.prisma.$transaction(
      missing.map(id => (this.prisma as any).ordertask.create({ data: { orderId: id, stage: 'Awal', status: 'OPEN', updated_at: new Date() } }))
    );
    return { created: missing.length };
  }
  listActive() {
    return (async () => {
      const rows = await (this.prisma as any).ordertask.findMany({
        where: {
          status: { not: TaskStatus.DONE as any },
          order: { status: { in: ['MENUNGGU','DALAM_PROSES'] } },
        },
        orderBy: { created_at: 'desc' },
        include: {
          order: { select: {
            id: true, code: true, status: true,
            customer_name: true, customer_phone: true, customer_address: true,
            item_type: true, gold_type: true, gold_color: true, ring_size: true,
            created_at: true, promised_ready_date: true, completed_date: true, pickup_date: true,
            notes: true, reference_image_urls: true
          }},
          account_ordertask_assigned_to_idToaccount: { select: { id: true, fullName: true, job_role: true } },
          account_ordertask_validated_by_idToaccount: { select: { id: true, fullName: true, job_role: true } },
        },
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
        rows.forEach((r: any) => { const c = map.get(Number(r.id)); if (c) (r as any).is_checked = !!c.is_checked; });
      } catch {}
      return rows.map((r: any) => this.mapTask(r));
    })();
  }

  async listByOrder(orderId: number) {
    const rows = await (this.prisma as any).ordertask.findMany({
      where: { orderId: Number(orderId) },
      orderBy: { created_at: 'asc' },
      include: {
        account_ordertask_assigned_to_idToaccount: { select: { id: true, fullName: true, job_role: true } },
      },
    });
    if (!rows.length) return rows;
    try {
      const sql = `SELECT id, is_checked FROM OrderTask WHERE orderId = ?`;
      const checks: any[] = await (this.prisma as any).$queryRawUnsafe(sql, Number(orderId));
      const map = new Map<number, any>();
      checks.forEach((c: any) => map.set(Number(c.id), c));
      rows.forEach((r: any) => { const c = map.get(Number(r.id)); if (c) (r as any).is_checked = !!c.is_checked; });
    } catch {}
    return rows.map((r: any) => this.mapTask(r));
  }
  async listAwaitingValidationByOrder(orderId: number) {
    // Only tasks for this order that are awaiting validation
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    const rows = await (this.prisma as any).ordertask.findMany({
      where: { orderId, status: TaskStatus.AWAITING_VALIDATION as any },
      orderBy: { created_at: 'desc' },
      include: {
        account_ordertask_assigned_to_idToaccount: { select: { id: true, fullName: true, job_role: true } },
      },
    });
    return rows.map((r: any) => this.mapTask(r));
  }

  async create(data: { orderId: number; stage?: string; notes?: string }) {
    // ensure order exists
    const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');
    const created = await (this.prisma as any).ordertask.create({
      data: {
        orderId: data.orderId,
        stage: data.stage,
        notes: data.notes,
        status: TaskStatus.OPEN as any,
        updated_at: new Date(),
      },
      include: { order: true },
    });
    return this.mapTask(created);
  }

  async update(id: number, patch: { stage?: string; notes?: string; status?: TaskStatus; assignedToId?: string | null }) {
    const exists = await (this.prisma as any).ordertask.findUnique({ where: { id }, include: { order: true } });
    if (!exists) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(exists.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    const data: any = { updated_at: new Date() };
    if (patch.stage !== undefined) data.stage = patch.stage;
    if (patch.notes !== undefined) data.notes = patch.notes;
    if (patch.status !== undefined) data.status = patch.status as any;
    if (patch.assignedToId !== undefined) data.assigned_to_id = patch.assignedToId;
    const updated = await (this.prisma as any).ordertask.update({ where: { id }, data });
    return this.mapTask(updated);
  }

  async remove(id: number) {
    const exists = await (this.prisma as any).ordertask.findUnique({ where: { id }, include: { order: true } });
    if (!exists) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(exists.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    await (this.prisma as any).ordertask.delete({ where: { id } });
    return { success: true };
  }

  async assign(id: number, assignedToId: string, actorUserId?: string) {
    const task = await (this.prisma as any).ordertask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
  // Assignment should not auto-jump to DALAM_PROSES.
    // If order is MENUNGGU and gets its first assignment, move it to DALAM_PROSES.
  const ops: any[] = [];
    if (task.order && task.order.status === 'MENUNGGU') {
      ops.push(this.prisma.order.update({ where: { id: task.orderId }, data: { status: 'DALAM_PROSES' as any } }));
      try {
        const actor = await this.prisma.account.findUnique({ where: { id: assignedToId }, select: { fullName: true, job_role: true } });
        ops.push((this.prisma as any).orderhistory.create({
          data: ({
            orderId: task.orderId,
            userId: actorUserId ?? assignedToId,
            action: 'STATUS_CHANGED',
            actorName: actor?.fullName ?? null,
            actorRole: (actor as any)?.job_role ?? null,
            statusFrom: 'MENUNGGU',
            statusTo: 'DALAM_PROSES',
            orderCode: task.order?.code ?? null,
            changeSummary: 'STATUS: MENUNGGU -> DALAM_PROSES',
            diff: JSON.stringify({ from: 'MENUNGGU', to: 'DALAM_PROSES' }),
          }) as any,
        }));
      } catch {}
    }
    ops.push((this.prisma as any).ordertask.update({ where: { id }, data: { assigned_to_id: assignedToId, status: TaskStatus.ASSIGNED as any, updated_at: new Date() } }));
  const txResult = await this.prisma.$transaction(ops);
  // realtime disabled
  // Return the task update result (last op)
    const updated = this.mapTask(txResult[txResult.length - 1]);
    // Fire-and-forget push to assignee
    try {
      const orderId = (updated as any)?.order?.id ?? (updated as any)?.orderId ?? id;
      const orderCode = (updated as any)?.order?.code ?? null;
      const label = orderCode ? `Order ${orderCode}` : `Order #${orderId}`;
      await this.push.notifyUser(assignedToId, {
        title: 'Tugas baru ditugaskan',
        body: `${label} telah ditugaskan kepada Anda`,
        data: { type: 'task.assigned', taskId: (updated as any)?.id ?? id, orderId, orderCode },
      });
    } catch (e) {
      this.logger.warn('Push notify assign failed: ' + (e as any)?.message);
    }
    return updated;
  }

  async assignBulk(params: { orderId: number; role: 'DESIGNER'|'CASTER'|'CARVER'|'DIAMOND_SETTER'|'FINISHER'|'INVENTORY'; userId: string; subtasks: { stage?: string; notes?: string }[]; actorUserId?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: params.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');

    const user = await this.prisma.account.findUnique({ where: { id: params.userId } });
    if (!user) throw new NotFoundException('User not found');

    // Business rule: block new assignment if the order already has any active tasks (assigned/in_progress/awaiting_validation)
    const blockingStatuses = ['ASSIGNED','IN_PROGRESS','AWAITING_VALIDATION'];
    const existingActive = await (this.prisma as any).ordertask.findMany({
      where: { orderId: params.orderId, status: { in: blockingStatuses as any }, assigned_to_id: { not: null } },
      include: { account_ordertask_assigned_to_idToaccount: true },
    });
    if (existingActive && existingActive.length > 0) {
      const names = Array.from(new Set(existingActive.map((t:any)=> t.account_ordertask_assigned_to_idToaccount?.fullName || t.assigned_to_id))).filter(Boolean);
      const who = names.length ? ` (${names.join(', ')})` : '';
      throw new BadRequestException(`Pesanan sedang dikerjakan${who}. Tidak bisa assign lagi sebelum verifikasi disetujui.`);
    }

    // Create multiple tasks with given stages/notes, assigned to the selected user
    const creates = params.subtasks.map(st => (this.prisma as any).ordertask.create({
      data: {
        orderId: params.orderId,
        stage: st.stage,
        notes: st.notes,
        assigned_to_id: params.userId,
        job_role: params.role as any,
        status: TaskStatus.ASSIGNED as any,
        updated_at: new Date(),
      },
    }));
    const updates: any[] = [...creates];
    // If order currently MENUNGGU, move to DALAM_PROSES on first bulk assignment
    if (order.status === 'MENUNGGU') {
      updates.push(this.prisma.order.update({ where: { id: params.orderId }, data: { status: 'DALAM_PROSES' as any } }));
      try {
        const actor = await this.prisma.account.findUnique({ where: { id: params.actorUserId || params.userId }, select: { fullName: true, job_role: true } });
        updates.push((this.prisma as any).orderhistory.create({
          data: ({
            orderId: params.orderId,
            userId: params.actorUserId || params.userId,
            action: 'STATUS_CHANGED',
            actorName: actor?.fullName ?? null,
            actorRole: (actor as any)?.job_role ?? null,
            statusFrom: 'MENUNGGU',
            statusTo: 'DALAM_PROSES',
            orderCode: order.code ?? null,
            changeSummary: 'STATUS: MENUNGGU -> DALAM_PROSES',
            diff: JSON.stringify({ from: 'MENUNGGU', to: 'DALAM_PROSES' }),
          }) as any,
        }));
      } catch {}
    }
    await this.prisma.$transaction(updates);
    // push notify target user once
    try {
      const label = order.code ? `Order ${order.code}` : `Order #${params.orderId}`;
      await this.push.notifyUser(params.userId, {
        title: 'Tugas baru ditugaskan',
        body: `${label} ditugaskan (${params.subtasks.length} sub-tugas)`,
        data: { type: 'task.assigned.bulk', orderId: params.orderId, orderCode: order.code ?? null, count: params.subtasks.length },
      });
    } catch (e) {
      this.logger.warn('Push notify assign-bulk failed: ' + (e as any)?.message);
    }
  // realtime disabled
    return { created: creates.length };
  }

  async requestDone(id: number, requesterUserId: string, notes?: string) {
    this.logger.debug(`requestDone id=${id} by=${requesterUserId}`);
    const task = await (this.prisma as any).ordertask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    if (task.assigned_to_id && task.assigned_to_id !== requesterUserId) throw new BadRequestException('Hanya yang ditugaskan yang bisa request selesai');

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
      const res = await (this.prisma as any).ordertask.update({ where: { id }, data: { notes: notes ?? task.notes, requested_done_at: new Date(), status: TaskStatus.AWAITING_VALIDATION as any, updated_at: new Date() } });
      // Log history: request validation
      try {
        const actor = await this.prisma.account.findUnique({ where: { id: requesterUserId }, select: { fullName: true, job_role: true } });
        await (this.prisma as any).orderhistory.create({
          data: ({
            orderId: task.orderId,
            userId: requesterUserId,
            action: 'TASK_EVENT',
            actorName: actor?.fullName ?? null,
            actorRole: (actor as any)?.job_role ?? null,
            orderCode: task.order?.code ?? null,
            changeSummary: `TASK_REQUESTED_VALIDATION (task#${id})`,
            diff: JSON.stringify({ taskId: id, event: 'REQUEST_VALIDATION', notes: notes ?? null }),
          }) as any,
        });
      } catch {}
      this.logger.debug(`requestDone OK id=${id}`);
      return this.mapTask(res);
    } catch (e: any) {
      this.logger.error(`requestDone FAIL id=${id} by=${requesterUserId}: ${e?.message}`, e?.stack);
      throw new BadRequestException(e?.message || 'Gagal mengajukan verifikasi');
    }
  }

  async validateDone(id: number, validatorUserId: string, notes?: string) {
    const task = await (this.prisma as any).ordertask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    const updated = await (this.prisma as any).ordertask.update({ where: { id }, data: { validated_by_id: validatorUserId, validated_at: new Date(), notes: notes ?? task.notes, status: TaskStatus.DONE as any, updated_at: new Date() } });
  // Log history: task validated
  try {
    const actor = await this.prisma.account.findUnique({ where: { id: validatorUserId }, select: { fullName: true, job_role: true } });
    await (this.prisma as any).orderhistory.create({
      data: ({
        orderId: task.orderId,
        userId: validatorUserId,
        action: 'TASK_EVENT',
        actorName: actor?.fullName ?? null,
        actorRole: (actor as any)?.job_role ?? null,
        orderCode: task.order?.code ?? null,
        changeSummary: `TASK_VALIDATED (task#${id})`,
        diff: JSON.stringify({ taskId: id, event: 'TASK_VALIDATED', notes: notes ?? null }),
      }) as any,
    });
  } catch {}
    return this.mapTask(updated);
  }

  async validateAllForOrderAndUser(orderId: number, targetUserId: string, validatorUserId: string, notes?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');

    const tasks: any[] = await (this.prisma as any).ordertask.findMany({
      where: { orderId, assigned_to_id: targetUserId, status: TaskStatus.AWAITING_VALIDATION as any },
      select: { id: true },
    });
    if (!tasks.length) return { updated: 0 };

    const ops = tasks.map(t => (this.prisma as any).ordertask.update({
      where: { id: t.id },
      data: { validated_by_id: validatorUserId, validated_at: new Date(), notes, status: TaskStatus.DONE as any, updated_at: new Date() },
    }));
    await this.prisma.$transaction(ops);
    // Log history: bulk validated
    try {
      const actor = await this.prisma.account.findUnique({ where: { id: validatorUserId }, select: { fullName: true, job_role: true } });
      await (this.prisma as any).orderhistory.create({
        data: ({
          orderId,
          userId: validatorUserId,
          action: 'TASK_EVENT',
          actorName: actor?.fullName ?? null,
          actorRole: (actor as any)?.job_role ?? null,
          orderCode: order.code ?? null,
          changeSummary: `TASKS_VALIDATED user=${targetUserId}`,
          diff: JSON.stringify({ userId: targetUserId, event: 'TASKS_VALIDATED', count: tasks.length, notes: notes ?? null }),
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
      const updates = ids.map(id => (this.prisma as any).ordertask.update({ where: { id }, data: { notes, requested_done_at: new Date(), status: TaskStatus.AWAITING_VALIDATION as any, updated_at: new Date() } }));
      await this.prisma.$transaction(updates);
      // Log history: bulk request validation
      try {
        const actor = await this.prisma.account.findUnique({ where: { id: requesterUserId }, select: { fullName: true, job_role: true } });
        await (this.prisma as any).orderhistory.create({
          data: ({
            orderId,
            userId: requesterUserId,
            action: 'TASK_EVENT',
            actorName: actor?.fullName ?? null,
            actorRole: (actor as any)?.job_role ?? null,
            orderCode: order.code ?? null,
            changeSummary: `TASKS_REQUESTED_VALIDATION user=${requesterUserId}`,
            diff: JSON.stringify({ userId: requesterUserId, event: 'REQUEST_VALIDATION_BULK', count: ids.length, notes: notes ?? null }),
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
    const task = await (this.prisma as any).ordertask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    if (task.assigned_to_id && task.assigned_to_id !== actorUserId) throw new BadRequestException('Hanya yang ditugaskan yang bisa mengubah checklist');
    if (task.status === TaskStatus.AWAITING_VALIDATION || task.status === TaskStatus.DONE) {
      throw new BadRequestException('Checklist tidak bisa diubah setelah request selesai diajukan atau divalidasi');
    }

    // New rule: cannot check while ASSIGNED; must explicitly accept first
    if (task.status === TaskStatus.ASSIGNED && value) {
      throw new BadRequestException('Mohon terima pesanan terlebih dahulu untuk memulai.');
    }

    const checkedVal = value ? 1 : 0;
    await this.prisma.$executeRaw`UPDATE OrderTask SET is_checked = ${checkedVal}, checked_at = ${value ? new Date() : null}, checked_by_id = ${value ? actorUserId : null} WHERE id = ${Number(id)}`;
    const updated = await (this.prisma as any).ordertask.findUnique({ where: { id } });
    return this.mapTask({ ...updated, is_checked: !!value });
  }

  async start(id: number, actorUserId: string) {
    this.logger.debug(`start id=${id} by=${actorUserId}`);
    const task = await (this.prisma as any).ordertask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
    if (task.status !== TaskStatus.ASSIGNED) throw new BadRequestException('Hanya task ASSIGNED yang bisa dimulai');
    if (task.assigned_to_id && task.assigned_to_id !== actorUserId) throw new BadRequestException('Hanya yang ditugaskan yang bisa memulai');
    const ops: any[] = [];
    // On first start, move order into DALAM_PROSES if currently DRAFT/DITERIMA
    if (task.order && task.order.status === 'MENUNGGU') {
      const actor = await this.prisma.account.findUnique({ where: { id: actorUserId }, select: { fullName: true, job_role: true } });
      ops.push(this.prisma.order.update({ where: { id: task.orderId }, data: { status: 'DALAM_PROSES' as any } }));
      ops.push((this.prisma as any).orderhistory.create({
        data: ({
          orderId: task.orderId,
          userId: actorUserId,
          action: 'STATUS_CHANGED',
          actorName: actor?.fullName ?? null,
          actorRole: (actor as any)?.job_role ?? null,
          statusFrom: task.order.status,
          statusTo: 'DALAM_PROSES',
          orderCode: task.order?.code ?? null,
          changeSummary: `STATUS: ${task.order.status} -> DALAM_PROSES`,
          diff: { from: task.order.status, to: 'DALAM_PROSES' },
        }) as any,
      }));
    }
    ops.push((this.prisma as any).ordertask.update({ where: { id }, data: { status: TaskStatus.IN_PROGRESS as any, updated_at: new Date() } }));
    const res = await this.prisma.$transaction(ops);
    return this.mapTask(res[res.length - 1]);
  }

  async acceptOrderForUser(orderId: number, actorUserId: string) {
    this.logger.debug(`acceptOrderForUser order=${orderId} by=${actorUserId}`);
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');

    const tasks: any[] = await (this.prisma as any).ordertask.findMany({
      where: { orderId, assigned_to_id: actorUserId, status: TaskStatus.ASSIGNED as any },
      select: { id: true },
    });
    if (!tasks.length) throw new BadRequestException('Tidak ada tugas ASSIGNED untuk diterima');

    const ops: any[] = tasks.map(t => (this.prisma as any).ordertask.update({ where: { id: t.id }, data: { status: TaskStatus.IN_PROGRESS as any, updated_at: new Date() } }));
    // Move order into DALAM_PROSES if currently DRAFT/DITERIMA
    if (order.status === 'MENUNGGU') {
      const actor = await this.prisma.account.findUnique({ where: { id: actorUserId }, select: { fullName: true, job_role: true } });
      ops.unshift(this.prisma.order.update({ where: { id: orderId }, data: { status: 'DALAM_PROSES' as any } }));
      ops.unshift((this.prisma as any).orderhistory.create({
        data: ({
          orderId,
          userId: actorUserId,
          action: 'STATUS_CHANGED',
          actorName: actor?.fullName ?? null,
          actorRole: (actor as any)?.job_role ?? null,
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

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '../types/task.dtos';

@Injectable()
export class TasksService {
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
    return (this.prisma as any).orderTask.findMany({
      where: {
        status: { not: TaskStatus.DONE as any },
        order: { status: { in: ['DRAFT','DITERIMA','DALAM_PROSES'] } },
      },
      orderBy: { createdAt: 'desc' },
      include: { order: true, assignedTo: true, validatedBy: true },
    });
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

  async assign(id: number, assignedToId: string) {
  const task = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
  if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
  return (this.prisma as any).orderTask.update({ where: { id }, data: { assignedToId, status: TaskStatus.ASSIGNED as any } });
  }

  async assignBulk(params: { orderId: number; role: 'pengrajin'|'kasir'|'owner'|'admin'; userId: string; subtasks: { stage?: string; notes?: string }[] }) {
    const order = await this.prisma.order.findUnique({ where: { id: params.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isOrderActive(order.status as any)) throw new BadRequestException('Order sudah nonaktif (history).');

    const user = await this.prisma.appUser.findUnique({ where: { id: params.userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== params.role) throw new BadRequestException('Role user tidak sesuai');

    // Create multiple tasks with given stages/notes, assigned to the selected user
    const creates = params.subtasks.map(st => (this.prisma as any).orderTask.create({
      data: {
        orderId: params.orderId,
        stage: st.stage,
        notes: st.notes,
        assignedToId: params.userId,
        status: TaskStatus.ASSIGNED as any,
      },
    }));
    await this.prisma.$transaction(creates);
    return { created: creates.length };
  }

  async requestDone(id: number, requesterUserId: string, notes?: string) {
  const task = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
  if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
  if (task.assignedToId && task.assignedToId !== requesterUserId) throw new BadRequestException('Hanya yang ditugaskan yang bisa request selesai');
  return (this.prisma as any).orderTask.update({ where: { id }, data: { notes: notes ?? task.notes, requestedDoneAt: new Date(), status: TaskStatus.AWAITING_VALIDATION as any } });
  }

  async validateDone(id: number, validatorUserId: string, notes?: string) {
  const task = await (this.prisma as any).orderTask.findUnique({ where: { id }, include: { order: true } });
    if (!task) throw new NotFoundException('Task not found');
  if (!this.isOrderActive(task.order?.status)) throw new BadRequestException('Order sudah nonaktif (history).');
  return (this.prisma as any).orderTask.update({ where: { id }, data: { validatedById: validatorUserId, validatedAt: new Date(), notes: notes ?? task.notes, status: TaskStatus.DONE as any } });
  }
}

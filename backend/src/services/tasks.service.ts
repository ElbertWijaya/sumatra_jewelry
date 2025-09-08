import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '../types/task.dtos';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  listActive() {
    return this.prisma.orderTask.findMany({
      where: { status: { not: 'DONE' } },
      orderBy: { createdAt: 'desc' },
      include: { order: true, assignedTo: true, validatedBy: true },
    });
  }

  async create(data: { orderId: number; stage?: string; notes?: string }) {
    // ensure order exists
    const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.orderTask.create({ data: { orderId: data.orderId, stage: data.stage, notes: data.notes, status: TaskStatus.OPEN as any } });
  }

  async update(id: number, patch: { stage?: string; notes?: string; status?: TaskStatus; assignedToId?: string | null }) {
    const exists = await this.prisma.orderTask.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Task not found');
    return this.prisma.orderTask.update({ where: { id }, data: { ...patch } as any });
  }

  async remove(id: number) {
    await this.prisma.orderTask.delete({ where: { id } });
    return { success: true };
  }

  async assign(id: number, assignedToId: string) {
    const task = await this.prisma.orderTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.orderTask.update({ where: { id }, data: { assignedToId, status: TaskStatus.ASSIGNED as any } });
  }

  async requestDone(id: number, notes?: string) {
    const task = await this.prisma.orderTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.orderTask.update({ where: { id }, data: { notes: notes ?? task.notes, requestedDoneAt: new Date(), status: TaskStatus.AWAITING_VALIDATION as any } });
  }

  async validateDone(id: number, validatorUserId: string, notes?: string) {
    const task = await this.prisma.orderTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.orderTask.update({ where: { id }, data: { validatedById: validatorUserId, validatedAt: new Date(), notes: notes ?? task.notes, status: TaskStatus.DONE as any } });
  }
}

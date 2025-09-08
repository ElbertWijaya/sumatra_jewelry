import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, AssignTaskDto, SubmitTaskDto, ReviewTaskDto, TaskStatusEnum } from '../types/task.dtos';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  listActive() {
    return this.prisma.orderTask.findMany({
      where: { status: { in: ['OPEN','ASSIGNED','IN_PROGRESS','IN_REVIEW'] as any } },
      include: { order: true, assignedTo: { select: { id: true, fullName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTaskDto) {
    const exists = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!exists) throw new NotFoundException('Order tidak ditemukan');
    return this.prisma.orderTask.create({ data: {
      orderId: dto.orderId,
      title: dto.title,
      description: dto.description,
      stage: dto.stage,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: 'OPEN' as any,
    }});
  }

  async assign(id: number, body: AssignTaskDto) {
    // validate user exists
    const user = await this.prisma.appUser.findUnique({ where: { id: body.userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.prisma.orderTask.update({ where: { id }, data: { assignedToId: body.userId, status: 'ASSIGNED' as any } });
  }

  async submit(id: number, userId: string, body: SubmitTaskDto) {
    const task = await this.prisma.orderTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task tidak ditemukan');
    if (task.assignedToId && task.assignedToId !== userId) throw new BadRequestException('Bukan pemilik task');
    return this.prisma.orderTask.update({ where: { id }, data: { status: 'IN_REVIEW' as any, lastSubmissionNote: body.note } });
  }

  async review(id: number, reviewerId: string, body: ReviewTaskDto) {
    if (!['APPROVED','REJECTED'].includes(body.decision)) throw new BadRequestException('Keputusan invalid');
    const status = body.decision as any;
    return this.prisma.orderTask.update({ where: { id }, data: { status, approvedById: status === 'APPROVED' ? reviewerId : null } });
  }

  remove(id: number) { return this.prisma.orderTask.delete({ where: { id } }); }
}

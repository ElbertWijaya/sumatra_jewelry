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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const task_dtos_1 = require("../types/task.dtos");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isOrderActive(status) {
        return status === 'DRAFT' || status === 'DITERIMA' || status === 'DALAM_PROSES';
    }
    listActive() {
        return this.prisma.orderTask.findMany({
            where: {
                status: { not: task_dtos_1.TaskStatus.DONE },
                order: { status: { in: ['DRAFT', 'DITERIMA', 'DALAM_PROSES'] } },
            },
            orderBy: { createdAt: 'desc' },
            include: { order: true, assignedTo: true, validatedBy: true },
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
    async assign(id, assignedToId) {
        const task = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        return this.prisma.orderTask.update({ where: { id }, data: { assignedToId, status: task_dtos_1.TaskStatus.ASSIGNED } });
    }
    async requestDone(id, notes) {
        const task = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        return this.prisma.orderTask.update({ where: { id }, data: { notes: notes ?? task.notes, requestedDoneAt: new Date(), status: task_dtos_1.TaskStatus.AWAITING_VALIDATION } });
    }
    async validateDone(id, validatorUserId, notes) {
        const task = await this.prisma.orderTask.findUnique({ where: { id }, include: { order: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (!this.isOrderActive(task.order?.status))
            throw new common_1.BadRequestException('Order sudah nonaktif (history).');
        return this.prisma.orderTask.update({ where: { id }, data: { validatedById: validatorUserId, validatedAt: new Date(), notes: notes ?? task.notes, status: task_dtos_1.TaskStatus.DONE } });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
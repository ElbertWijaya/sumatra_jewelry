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
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    listActive() {
        return this.prisma.orderTask.findMany({
            where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW'] } },
            include: { order: true, assignedTo: { select: { id: true, fullName: true, role: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(dto) {
        const exists = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!exists)
            throw new common_1.NotFoundException('Order tidak ditemukan');
        return this.prisma.orderTask.create({ data: {
                orderId: dto.orderId,
                title: dto.title,
                description: dto.description,
                stage: dto.stage,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                status: 'OPEN',
            } });
    }
    async assign(id, body) {
        const user = await this.prisma.appUser.findUnique({ where: { id: body.userId } });
        if (!user)
            throw new common_1.NotFoundException('User tidak ditemukan');
        return this.prisma.orderTask.update({ where: { id }, data: { assignedToId: body.userId, status: 'ASSIGNED' } });
    }
    async submit(id, userId, body) {
        const task = await this.prisma.orderTask.findUnique({ where: { id } });
        if (!task)
            throw new common_1.NotFoundException('Task tidak ditemukan');
        if (task.assignedToId && task.assignedToId !== userId)
            throw new common_1.BadRequestException('Bukan pemilik task');
        return this.prisma.orderTask.update({ where: { id }, data: { status: 'IN_REVIEW', lastSubmissionNote: body.note } });
    }
    async review(id, reviewerId, body) {
        if (!['APPROVED', 'REJECTED'].includes(body.decision))
            throw new common_1.BadRequestException('Keputusan invalid');
        const status = body.decision;
        return this.prisma.orderTask.update({ where: { id }, data: { status, approvedById: status === 'APPROVED' ? reviewerId : null } });
    }
    remove(id) { return this.prisma.orderTask.delete({ where: { id } }); }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
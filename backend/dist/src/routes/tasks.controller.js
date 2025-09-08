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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/jwt-auth.guard");
const roles_decorator_1 = require("../security/roles.decorator");
const roles_guard_1 = require("../security/roles.guard");
const tasks_service_1 = require("../services/tasks.service");
const task_dtos_1 = require("../types/task.dtos");
const current_user_decorator_1 = require("../security/current-user.decorator");
let TasksController = class TasksController {
    constructor(tasks) {
        this.tasks = tasks;
    }
    list() { return this.tasks.listActive(); }
    create(dto) { return this.tasks.create(dto); }
    update(id, dto) { return this.tasks.update(id, dto); }
    remove(id) { return this.tasks.remove(id); }
    assign(id, dto) { return this.tasks.assign(id, dto.assignedToId); }
    assignBulk(dto) {
        return this.tasks.assignBulk({ orderId: dto.orderId, role: dto.role, userId: dto.userId, subtasks: dto.subtasks });
    }
    requestDone(id, dto, user) {
        return this.tasks.requestDone(id, user.userId, dto.notes);
    }
    validate(id, dto, user) {
        return this.tasks.validateDone(id, user.userId, dto.notes);
    }
    awaitingValidation(orderId) {
        return this.tasks.listAwaitingValidationByOrder(orderId);
    }
    backfill() { return this.tasks.backfillActive(); }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'DESIGNER', 'CASTER', 'CARVER', 'DIAMOND_SETTER', 'FINISHER', 'INVENTORY'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_dtos_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, task_dtos_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, task_dtos_1.AssignTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('assign-bulk'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_dtos_1.AssignBulkDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "assignBulk", null);
__decorate([
    (0, common_1.Post)(':id/request-done'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'DESIGNER', 'CASTER', 'CARVER', 'DIAMOND_SETTER', 'FINISHER', 'INVENTORY'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, task_dtos_1.RequestDoneDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "requestDone", null);
__decorate([
    (0, common_1.Post)(':id/validate'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, task_dtos_1.ValidateTaskDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)('awaiting-validation'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES'),
    __param(0, (0, common_1.Query)('orderId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "awaitingValidation", null);
__decorate([
    (0, common_1.Post)('backfill'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "backfill", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map
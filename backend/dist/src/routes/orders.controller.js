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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../security/current-user.decorator");
const jwt_auth_guard_1 = require("../security/jwt-auth.guard");
const roles_decorator_1 = require("../security/roles.decorator");
const roles_guard_1 = require("../security/roles.guard");
const orders_service_1 = require("../services/orders.service");
const order_dtos_1 = require("../types/order.dtos");
let OrdersController = class OrdersController {
    constructor(orders) {
        this.orders = orders;
    }
    create(dto, user) {
        console.log('[CreateOrder] dto keys:', Object.keys(dto || {}));
        console.log('[CreateOrder] dto preview:', {
            customerName: dto.customerName,
            jenisBarang: dto.jenisBarang,
            jenisEmas: dto.jenisEmas,
            warnaEmas: dto.warnaEmas,
            images: dto.referensiGambarUrls?.length || 0,
            stones: dto.stones?.length || 0,
        });
        console.log('[CreateOrder] dto types:', {
            customerName: typeof dto.customerName,
            jenisBarang: typeof dto.jenisBarang,
            jenisEmas: typeof dto.jenisEmas,
            warnaEmas: typeof dto.warnaEmas,
        });
        if (!dto.customerName && dto['__rawFallbackChecked'] !== true) {
            try {
                const anyReq = global.process?.domain?.req;
                console.warn('[CreateOrder] Required fields empty. Consider adding @Req() req param for deeper debug.');
            }
            catch { }
        }
        if (!dto.customerName || !dto.jenisBarang || !dto.jenisEmas || !dto.warnaEmas) {
            console.warn('[CreateOrder] Falsy required fields BEFORE service:', {
                customerName: dto.customerName,
                jenisBarang: dto.jenisBarang,
                jenisEmas: dto.jenisEmas,
                warnaEmas: dto.warnaEmas,
            });
        }
        return this.orders.create(dto, user.userId);
    }
    findAll(status) {
        if (status && !order_dtos_1.ORDER_STATUS_VALUES.includes(status)) {
            throw new common_1.BadRequestException('Status invalid');
        }
        return this.orders.findAll({ status });
    }
    findOne(id) {
        return this.orders.findById(id);
    }
    history(id) {
        return this.orders.history(id);
    }
    updateStatus(id, dto, user) {
        return this.orders.updateStatus(id, dto, user.userId);
    }
    assign(id, dto, user) {
        return this.orders.assignTask(id, dto, user.userId);
    }
    requestHandover(id, dto, user) {
        return this.orders.requestHandover(id, dto, user.userId);
    }
    validateHandover(id, user) {
        return this.orders.validateHandover(id, user.userId);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'kasir', 'owner'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dtos_1.CreateOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'kasir', 'owner', 'pengrajin'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'kasir', 'owner', 'pengrajin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, roles_decorator_1.Roles)('admin', 'kasir', 'owner', 'pengrajin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "history", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('admin', 'kasir', 'owner'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, order_dtos_1.UpdateOrderStatusDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/assign'),
    (0, roles_decorator_1.Roles)('admin', 'kasir', 'owner'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, order_dtos_1.AssignOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "assign", null);
__decorate([
    (0, common_1.Put)(':id/handover-request'),
    (0, roles_decorator_1.Roles)('admin', 'kasir', 'owner', 'pengrajin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, order_dtos_1.RequestHandoverDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "requestHandover", null);
__decorate([
    (0, common_1.Put)(':id/handover-validate'),
    (0, roles_decorator_1.Roles)('admin', 'kasir', 'owner'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "validateHandover", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map
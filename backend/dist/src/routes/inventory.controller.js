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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/jwt-auth.guard");
const roles_decorator_1 = require("../security/roles.decorator");
const roles_guard_1 = require("../security/roles.guard");
const inventory_service_1 = require("../services/inventory.service");
const current_user_decorator_1 = require("../security/current-user.decorator");
let InventoryController = class InventoryController {
    constructor(inv) {
        this.inv = inv;
    }
    get(id) { return this.inv.get(id); }
    listByOrder(orderId) { return this.inv.listByOrder(orderId); }
    search(q, category, status, branchLocation, placement, statusEnum, dateFrom, dateTo, limit, offset) {
        return this.inv.search({ q, category, status, dateFrom, dateTo, limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined, branchLocation, placement, statusEnum });
    }
    requests(user) {
        const role = (user?.jobRole || '').toUpperCase();
        const uid = role === 'INVENTORY' ? user.userId : undefined;
        return this.inv.listRequestsForInventory(uid);
    }
    create(dto, user) { return this.inv.create(dto, user.userId); }
    update(id, dto, user) { return this.inv.update(id, dto, user.userId); }
    history(id) {
        return this.inv.get(id).then(async (item) => {
            if (!item?.orderId)
                return [];
            return this.inv['prisma'].orderHistory.findMany({
                where: { orderId: item.orderId, field: 'inventory_item' },
                orderBy: { changedAt: 'desc' },
            });
        });
    }
    remove(id, user) {
        return this.inv.softDelete(id, user.userId);
    }
    restore(id, user) {
        return this.inv.restore(id, user.userId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'INVENTORY'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'INVENTORY'),
    __param(0, (0, common_1.Query)('orderId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "listByOrder", null);
__decorate([
    (0, common_1.Get)('items/search/all'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'INVENTORY'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('branchLocation')),
    __param(4, (0, common_1.Query)('placement')),
    __param(5, (0, common_1.Query)('statusEnum')),
    __param(6, (0, common_1.Query)('dateFrom')),
    __param(7, (0, common_1.Query)('dateTo')),
    __param(8, (0, common_1.Query)('limit')),
    __param(9, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('requests/list'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'INVENTORY'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "requests", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'INVENTORY'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'INVENTORY'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_a = typeof inventory_dtos_1.UpdateInventoryDto !== "undefined" && inventory_dtos_1.UpdateInventoryDto) === "function" ? _a : Object, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'INVENTORY'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "history", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'INVENTORY'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "restore", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map
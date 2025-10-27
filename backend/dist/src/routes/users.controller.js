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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../security/jwt-auth.guard");
const roles_guard_1 = require("../security/roles.guard");
const roles_decorator_1 = require("../security/roles.decorator");
let UsersController = class UsersController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(req) {
        const userId = req.user.sub;
        const user = await this.prisma.account.findUnique({
            where: { id: userId },
            select: {
                phone: true,
                address: true,
                created_at: true,
                branch: { select: { name: true, address: true } }
            }
        });
        return {
            phone: user?.phone || '',
            address: user?.address || '',
            cabang: user?.branch?.name || '',
            alamatCabang: user?.branch?.address || '',
            tanggalGabung: user?.created_at ? user.created_at.toISOString().split('T')[0] : '',
            branchName: user?.branch?.name || '',
            branchAddress: user?.branch?.address || '',
            joinedAt: user?.created_at ? user.created_at.toISOString().split('T')[0] : ''
        };
    }
    async list(jobRole) {
        const where = {};
        if (jobRole)
            where.job_role = jobRole;
        return this.prisma.account.findMany({ where: Object.keys(where).length ? where : undefined, select: { id: true, fullName: true, email: true, job_role: true, branch_id: true } });
    }
    async updateMe(req, body) {
        const userId = req.user.sub;
        const updateData = {};
        if (body.phone !== undefined)
            updateData.phone = body.phone;
        if (body.address !== undefined)
            updateData.address = body.address;
        if (body.branch_id !== undefined)
            updateData.branch_id = body.branch_id;
        const updated = await this.prisma.account.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                fullName: true,
                job_role: true,
                phone: true,
                address: true,
                branch_id: true,
                created_at: true,
                branch: { select: { name: true, address: true } }
            }
        });
        return updated;
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'DESIGNER', 'CASTER', 'CARVER', 'DIAMOND_SETTER', 'FINISHER', 'INVENTORY'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'DESIGNER', 'CASTER', 'CARVER', 'DIAMOND_SETTER', 'FINISHER', 'INVENTORY'),
    __param(0, (0, common_1.Query)('jobRole')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, roles_decorator_1.Roles)('ADMINISTRATOR', 'SALES', 'DESIGNER', 'CASTER', 'CARVER', 'DIAMOND_SETTER', 'FINISHER', 'INVENTORY'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMe", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
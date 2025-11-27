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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = require("argon2");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async validateUser(email, password) {
        const user = await this.prisma.account.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const hash = user.password || '';
        let match = false;
        try {
            if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
                match = await bcrypt.compare(password, hash);
            }
            else {
                match = await argon2.verify(hash, password);
            }
        }
        catch {
            try {
                match = await bcrypt.compare(password, hash);
            }
            catch { }
            if (!match) {
                try {
                    match = await argon2.verify(hash, password);
                }
                catch { }
            }
        }
        if (!match)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return user;
    }
    async login(email, password) {
        const user = await this.validateUser(email, password);
        const fullUser = await this.prisma.account.findUnique({
            where: { id: user.id },
            include: { branch: { select: { name: true, address: true } } }
        });
        if (!fullUser)
            throw new common_1.UnauthorizedException('User not found');
        const payload = { sub: fullUser.id, jobRole: fullUser.job_role ?? null, email: fullUser.email };
        const accessToken = await this.jwt.signAsync(payload);
        console.log('[LOGIN] user:', fullUser.email, 'job_role:', fullUser.job_role, 'token:', accessToken);
        return {
            accessToken,
            user: {
                id: fullUser.id,
                email: fullUser.email,
                fullName: fullUser.fullName,
                job_role: fullUser.job_role ?? null,
                phone: fullUser.phone ?? null,
                address: fullUser.address ?? null,
                branch_id: fullUser.branch_id ?? null,
                branchName: fullUser.branch?.name ?? null,
                branchAddress: fullUser.branch?.address ?? null,
                joinedAt: fullUser.created_at ?? null,
            },
        };
    }
    async register(data) {
        const hash = await argon2.hash(data.password);
        const defaultBranch = await this.prisma.branch.findFirst();
        if (!defaultBranch)
            throw new common_1.UnauthorizedException('Branch belum tersedia, hubungi admin.');
        const user = await this.prisma.account.create({
            data: {
                email: data.email,
                password: hash,
                fullName: data.fullName,
                job_role: data.jobRole,
                branch: { connect: { id: defaultBranch.id } }
            },
        });
        return { id: user.id, email: user.email };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map
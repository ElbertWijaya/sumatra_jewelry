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
        const user = await this.prisma.appUser.findUnique({ where: { email } });
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
        const payload = { sub: user.id, jobRole: user.jobRole ?? null, email: user.email };
        const accessToken = await this.jwt.signAsync(payload);
        console.log('[LOGIN] user:', user.email, 'jobRole:', user.jobRole, 'token:', accessToken);
        return {
            accessToken,
            user: { id: user.id, email: user.email, fullName: user.fullName, jobRole: user.jobRole ?? null },
        };
    }
    async register(data) {
        const hash = await argon2.hash(data.password);
        const user = await this.prisma.appUser.create({
            data: { email: data.email, password: hash, fullName: data.fullName, role: data.role, jobRole: data.jobRole },
        });
        return { id: user.id, email: user.email };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
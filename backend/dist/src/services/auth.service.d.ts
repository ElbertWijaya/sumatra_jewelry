import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    validateUser(email: string, password: string): unknown;
    login(email: string, password: string): unknown;
    register(data: {
        email: string;
        password: string;
        fullName: string;
        jobRole?: string | null;
    }): unknown;
}

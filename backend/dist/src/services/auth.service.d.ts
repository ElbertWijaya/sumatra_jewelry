import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
        createdAt: Date;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    register(data: {
        email: string;
        password: string;
        fullName: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
    }>;
}

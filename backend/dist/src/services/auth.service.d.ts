import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    validateUser(email: string, password: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
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
        role: 'admin' | 'owner' | 'kasir' | 'pengrajin';
    }): Promise<{
        id: string;
        email: string;
    }>;
}

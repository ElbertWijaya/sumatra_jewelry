import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        jobRole: import(".prisma/client").$Enums.TaskJobRole | null;
        password: string;
        createdAt: Date;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            jobRole: any;
        };
    }>;
    register(data: {
        email: string;
        password: string;
        fullName: string;
        jobRole?: string | null;
        role?: 'admin' | 'owner' | 'kasir' | 'pengrajin';
    }): Promise<{
        id: any;
        email: any;
    }>;
}

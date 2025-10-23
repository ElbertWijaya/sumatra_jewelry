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
        job_role: string;
        password: string;
        branch_id: number;
        phone: string | null;
        address: string | null;
        created_at: Date;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            job_role: string;
            phone: string | null;
            address: string | null;
            branch_id: number;
            created_at: Date;
        };
    }>;
    register(data: {
        email: string;
        password: string;
        fullName: string;
        jobRole?: string | null;
    }): Promise<{
        id: string;
        email: string;
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    list(jobRole?: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        job_role: string;
        branch_id: number;
    }[]>;
    updateMe(req: any, body: {
        avatar?: string;
        phone?: string;
        address?: string;
        branchName?: string;
        branchAddress?: string;
    }): Promise<{
        id: string;
        email: string;
        fullName: string;
        job_role: string;
        branch_id: number;
        phone: string | null;
        address: string | null;
        created_at: Date;
    }>;
}

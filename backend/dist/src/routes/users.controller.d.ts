import { PrismaService } from '../prisma/prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(req: any): Promise<{
        phone: string;
        address: string;
        cabang: string;
        alamatCabang: string;
        tanggalGabung: string;
        branchName: string;
        branchAddress: string;
        joinedAt: string;
    }>;
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
        branchName: string;
        branchAddress: string;
        joinedAt: string;
        id: string;
        email: string;
        fullName: string;
        job_role: string;
        branch_id: number;
        phone: string | null;
        address: string | null;
        created_at: Date;
        branch: {
            address: string | null;
            name: string;
        };
    }>;
    changePassword(req: any, body: {
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}

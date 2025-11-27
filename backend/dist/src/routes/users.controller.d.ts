import { PrismaService } from '../prisma/prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(req: any): unknown;
    list(jobRole?: string): unknown;
    updateMe(req: any, body: {
        avatar?: string;
        phone?: string;
        address?: string;
        branchName?: string;
        branchAddress?: string;
    }): unknown;
    changePassword(req: any, body: {
        oldPassword: string;
        newPassword: string;
    }): unknown;
}

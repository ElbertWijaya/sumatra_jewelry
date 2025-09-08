import { PrismaService } from '../prisma/prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    list(role?: string, jobRole?: string): Promise<any>;
}

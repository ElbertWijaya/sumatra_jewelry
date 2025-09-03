import { AuthService } from '../services/auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare const ROLES: readonly ["admin", "owner", "kasir", "pengrajin"];
type RoleUnion = typeof ROLES[number];
declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    role: RoleUnion;
}
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
    }>;
}
export {};

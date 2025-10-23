import { AuthService } from '../services/auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    jobRole?: string;
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
            job_role: string;
            phone: string | null;
            address: string | null;
            branch_id: number;
            created_at: Date;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
    }>;
}
export {};

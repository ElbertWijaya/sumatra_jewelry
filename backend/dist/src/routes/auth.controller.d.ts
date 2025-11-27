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
    login(dto: LoginDto): unknown;
    register(dto: RegisterDto): unknown;
}
export {};

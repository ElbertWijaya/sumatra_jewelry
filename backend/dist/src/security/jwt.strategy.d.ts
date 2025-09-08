import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
interface JwtPayload {
    sub: string;
    jobRole?: string | null;
    email: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        jobRole: string | null;
        email: string;
    }>;
}
export {};

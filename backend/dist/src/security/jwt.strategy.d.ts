import { ConfigService } from '@nestjs/config';
interface JwtPayload {
    sub: string;
    jobRole?: string | null;
    email: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): unknown;
}
export {};

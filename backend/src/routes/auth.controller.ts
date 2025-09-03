import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsNotEmpty, MinLength, IsIn } from 'class-validator';

import { AuthService } from '../services/auth.service';

class LoginDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
}

const ROLES = ['admin','owner','kasir','pengrajin'] as const;
type RoleUnion = typeof ROLES[number];
class RegisterDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
  @IsNotEmpty() fullName!: string;
  @IsIn(ROLES) role!: RoleUnion;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }
}

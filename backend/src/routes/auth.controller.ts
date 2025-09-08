import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsNotEmpty, MinLength, IsIn, IsOptional } from 'class-validator';

import { AuthService } from '../services/auth.service';

class LoginDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
}

class RegisterDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
  @IsNotEmpty() fullName!: string;
  @IsOptional() jobRole?: string; // Updated to only accept jobRole
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

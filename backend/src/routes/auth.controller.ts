import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
}

class RegisterDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
  @IsNotEmpty() fullName!: string;
  @IsNotEmpty() role!: string; // validate against enum later
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

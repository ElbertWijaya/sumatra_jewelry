import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.appUser.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const match = await argon2.verify(user.password, password);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, role: user.role, email: user.email };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }

  async register(data: { email: string; password: string; fullName: string; role: 'admin' | 'owner' | 'kasir' | 'pengrajin' }) {
    const hash = await argon2.hash(data.password);
    const user = await this.prisma.appUser.create({
      data: { email: data.email, password: hash, fullName: data.fullName, role: data.role },
    });
    return { id: user.id, email: user.email };
  }
}

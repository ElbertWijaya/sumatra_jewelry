import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles('admin','owner','kasir','pengrajin')
  async list(@Query('role') role?: string) {
    const where = role ? { role: role as any } : undefined;
    return this.prisma.appUser.findMany({ where, select: { id: true, fullName: true, email: true, role: true } });
  }
}

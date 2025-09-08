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
  async list(@Query('role') role?: string, @Query('jobRole') jobRole?: string) {
    const where: any = {};
    if (role) where.role = role;
    if (jobRole) where.jobRole = jobRole;
  return this.prisma.appUser.findMany({ where: Object.keys(where).length ? where : undefined, select: { id: true, fullName: true, email: true, role: true } });
  }
}

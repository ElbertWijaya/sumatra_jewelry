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
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  async list(@Query('jobRole') jobRole?: string) {
    const where: any = {};
    if (jobRole) where.jobRole = jobRole;
    return (this.prisma as any).appUser.findMany({ where: Object.keys(where).length ? where : undefined, select: { id: true, fullName: true, email: true, jobRole: true } });
  }
}

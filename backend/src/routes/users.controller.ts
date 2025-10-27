import { Controller, Get, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  async getProfile(@Req() req: any) {
    const userId = req.user.sub;
    const user = await this.prisma.account.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        address: true,
        created_at: true,
        branch: { select: { name: true, address: true } }
      }
    });
    return {
      phone: user?.phone || '',
      address: user?.address || '',
      cabang: user?.branch?.name || '', // field lebih eksplisit sesuai frontend
      alamatCabang: user?.branch?.address || '',
      tanggalGabung: user?.created_at ? user.created_at.toISOString().split('T')[0] : '', // format YYYY-MM-DD
      branchName: user?.branch?.name || '',
      branchAddress: user?.branch?.address || '',
      joinedAt: user?.created_at ? user.created_at.toISOString().split('T')[0] : ''
    };
  }

  @Get()
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  async list(@Query('jobRole') jobRole?: string) {
  const where: any = {};
  if (jobRole) where.job_role = jobRole;
  return this.prisma.account.findMany({ where: Object.keys(where).length ? where : undefined, select: { id: true, fullName: true, email: true, job_role: true, branch_id: true } });
  }

  @Put('me')
  @Roles('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY')
  async updateMe(@Req() req: any, @Body() body: { avatar?: string; phone?: string; address?: string; branchName?: string; branchAddress?: string }) {
    const userId = req.user.sub;
    const updateData: any = {};
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    // Untuk update branch, gunakan branch_id
    if ((body as any).branch_id !== undefined) updateData.branch_id = (body as any).branch_id;
    const updated = await this.prisma.account.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        job_role: true,
        phone: true,
        address: true,
        branch_id: true,
        created_at: true,
        branch: { select: { name: true, address: true } }
      }
    });
    return updated;
  }
}
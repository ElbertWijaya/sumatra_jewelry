import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';
import { CurrentUser } from '../security/current-user.decorator';
import { RequestUser } from '../types/order.dtos';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inv: InventoryService) {}

  @Get(':id')
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  get(@Param('id', ParseIntPipe) id: number) { return this.inv.get(id); }

  @Get()
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  listByOrder(@Query('orderId', ParseIntPipe) orderId: number) { return this.inv.listByOrder(orderId); }

  @Get('items/search/all')
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  search(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.inv.search({ q, category, status, dateFrom, dateTo, limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined });
  }

  @Get('requests/list')
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  requests(@CurrentUser() user: RequestUser) {
    // Jika role INVENTORY, tampilkan hanya yang ditugaskan ke user tsb; admin/sales lihat semua
    const role = (user?.jobRole || '').toUpperCase();
    const uid = role === 'INVENTORY' ? user.userId : undefined;
    return this.inv.listRequestsForInventory(uid);
  }

  @Post()
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  create(@Body() dto: CreateInventoryDto, @CurrentUser() user: RequestUser) { return this.inv.create(dto, user.userId); }

  @Patch(':id')
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryDto, @CurrentUser() user: RequestUser) { return this.inv.update(id, dto, user.userId); }

  @Get(':id/history')
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  history(@Param('id', ParseIntPipe) id: number) {
    // Audit tersimpan di OrderHistory dengan field 'inventory_item' untuk order terkait item ini
    return this.inv.get(id).then(async (item: any) => {
      if (!item?.orderId) return [];
      return (this as any).inv['prisma'].orderHistory.findMany({
        where: { orderId: item.orderId, field: 'inventory_item' },
        orderBy: { changedAt: 'desc' },
      });
    });
  }
}

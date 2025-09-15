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

  @Post()
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  create(@Body() dto: CreateInventoryDto, @CurrentUser() user: RequestUser) { return this.inv.create(dto, user.userId); }

  @Patch(':id')
  @Roles('ADMINISTRATOR','SALES','INVENTORY')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryDto, @CurrentUser() user: RequestUser) { return this.inv.update(id, dto, user.userId); }
}

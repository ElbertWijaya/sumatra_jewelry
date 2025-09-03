import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Put, UseGuards } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../types/order.dtos';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';
import { CurrentUser } from '../security/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  @Roles('admin','kasir','owner')
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.orders.create(dto, user.userId);
  }

  @Get()
  @Roles('admin','kasir','owner','pengrajin')
  findAll(@Query('status') status?: string) {
    return this.orders.findAll({ status: status as any });
  }

  @Get(':id')
  @Roles('admin','kasir','owner','pengrajin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orders.findById(id);
  }

  @Put(':id/status')
  @Roles('admin','kasir','owner')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto, @CurrentUser() user: any) {
    return this.orders.updateStatus(id, dto, user.userId);
  }
}

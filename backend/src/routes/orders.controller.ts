import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Put, UseGuards, BadRequestException } from '@nestjs/common';

import { CurrentUser } from '../security/current-user.decorator';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, RequestUser, ORDER_STATUS_VALUES, OrderStatusEnum } from '../types/order.dtos';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  @Roles('admin','kasir','owner')
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: RequestUser) {
    // Debug log (sementara)
    console.log('[CreateOrder] dto keys:', Object.keys(dto || {}));
    console.log('[CreateOrder] dto preview:', {
      customerName: dto.customerName,
      jenisBarang: dto.jenisBarang,
      jenisEmas: dto.jenisEmas,
      warnaEmas: dto.warnaEmas,
      images: dto.referensiGambarUrls?.length || 0,
      stones: dto.stones?.length || 0,
    });
    if (!dto.customerName || !dto.jenisBarang || !dto.jenisEmas || !dto.warnaEmas) {
      console.warn('[CreateOrder] Falsy required fields BEFORE service:', {
        customerName: dto.customerName,
        jenisBarang: dto.jenisBarang,
        jenisEmas: dto.jenisEmas,
        warnaEmas: dto.warnaEmas,
      });
    }
    return this.orders.create(dto, user.userId);
  }

  @Get()
  @Roles('admin','kasir','owner','pengrajin')
  findAll(@Query('status') status?: OrderStatusEnum) {
    if (status && !ORDER_STATUS_VALUES.includes(status)) {
      throw new BadRequestException('Status invalid');
    }
    return this.orders.findAll({ status });
  }

  @Get(':id')
  @Roles('admin','kasir','owner','pengrajin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orders.findById(id);
  }

  @Get(':id/history')
  @Roles('admin','kasir','owner','pengrajin')
  history(@Param('id', ParseIntPipe) id: number) {
    return this.orders.history(id);
  }

  @Put(':id/status')
  @Roles('admin','kasir','owner')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto, @CurrentUser() user: RequestUser) {
    return this.orders.updateStatus(id, dto, user.userId);
  }
}

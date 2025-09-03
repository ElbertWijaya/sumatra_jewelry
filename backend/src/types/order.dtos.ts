import { IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export const ORDER_STATUS_VALUES = ['DRAFT','DITERIMA','DALAM_PROSES','SIAP','DIAMBIL','BATAL'] as const;
export type OrderStatusEnum = typeof ORDER_STATUS_VALUES[number];

export class CreateOrderDto {
  @IsString() @IsNotEmpty() customerName!: string;
  @IsOptional() @IsString() customerPhone?: string;
  @IsString() @IsNotEmpty() jenis!: string;
  @IsOptional() @IsInt() kadar?: number;
  @IsOptional() @IsNumber() @Min(0) beratTarget?: number;
  @IsNumber() @Min(0) ongkos!: number;
  @IsOptional() @IsNumber() @Min(0) dp?: number;
  @IsOptional() @IsDateString() tanggalJanjiJadi?: string;
  @IsOptional() @IsString() catatan?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUS_VALUES) status!: OrderStatusEnum;
  @IsOptional() @IsNumber() beratAkhir?: number;
}

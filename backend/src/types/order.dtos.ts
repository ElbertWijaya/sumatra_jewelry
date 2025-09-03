import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

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
  @IsString() @IsNotEmpty() status!: string; // validated in service
  @IsOptional() @IsNumber() beratAkhir?: number;
}

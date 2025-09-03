export declare class CreateOrderDto {
    customerName: string;
    customerPhone?: string;
    jenis: string;
    kadar?: number;
    beratTarget?: number;
    ongkos: number;
    dp?: number;
    tanggalJanjiJadi?: string;
    catatan?: string;
}
export declare class UpdateOrderStatusDto {
    status: string;
    beratAkhir?: number;
}

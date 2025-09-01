export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  weightGr?: number;
  stock?: number;
  category?: string;
}

export interface GoldPriceResponse {
  pricePerGram: number;
  updatedAt: string;
}

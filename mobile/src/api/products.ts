import { apiGet } from './client';
import { Product } from '@types';

export async function getProducts(): Promise<Product[]> {
  // Placeholder: anggap endpoint /products
  const data = await apiGet<Product[]>('/products');
  return data;
}

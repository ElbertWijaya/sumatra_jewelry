import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@api/client';
import { GoldPriceResponse } from '@types';

export function useGoldPrice() {
  return useQuery({
    queryKey: ['goldPrice'],
    queryFn: async () => {
      // Endpoint placeholder
      const data = await apiGet<GoldPriceResponse>('/gold/price');
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}

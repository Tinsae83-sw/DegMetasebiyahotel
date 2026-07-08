import { useQuery } from '@tanstack/react-query';
import { kitchenApi } from '@/lib/kitchen/api';
import type { KitchenPerformance } from '@/lib/kitchen/types';

export function useKitchenPerformance(startDate?: string, endDate?: string) {
  const performance = useQuery({
    queryKey: ['kitchen-performance', startDate, endDate],
    queryFn: () => kitchenApi.getKitchenPerformance(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });

  return {
    performance: performance.data as KitchenPerformance | undefined,
    isLoading: performance.isLoading,
    error: performance.error,
    refetch: performance.refetch,
  };
}

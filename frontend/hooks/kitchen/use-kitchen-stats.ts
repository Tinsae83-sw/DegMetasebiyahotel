import { useQuery } from '@tanstack/react-query';
import { kitchenApi } from '@/lib/kitchen/api';
import type { KitchenStats } from '@/lib/kitchen/types';

export function useKitchenStats() {
  const stats = useQuery({
    queryKey: ['kitchen-stats'],
    queryFn: () => kitchenApi.getKitchenStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    stats: stats.data as KitchenStats | undefined,
    isLoading: stats.isLoading,
    error: stats.error,
    refetch: stats.refetch,
  };
}

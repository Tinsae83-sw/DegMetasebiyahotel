import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '@/lib/kitchen/api';
import { toast } from 'sonner';
import type { KitchenSettings } from '@/lib/kitchen/types';

export function useKitchenSettings() {
  const queryClient = useQueryClient();

  const settings = useQuery({
    queryKey: ['kitchen-settings'],
    queryFn: () => kitchenApi.getKitchenSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<KitchenSettings>) => kitchenApi.updateKitchenSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  return {
    settings: settings.data as KitchenSettings | undefined,
    isLoading: settings.isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    refetch: settings.refetch,
  };
}

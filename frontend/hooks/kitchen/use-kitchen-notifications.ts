import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '@/lib/kitchen/api';
import { toast } from 'sonner';
import type { KitchenNotification } from '@/lib/kitchen/types';

export function useKitchenNotifications() {
  const queryClient = useQueryClient();

  const notifications = useQuery({
    queryKey: ['kitchen-notifications'],
    queryFn: () => kitchenApi.getNotifications(),
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => kitchenApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => kitchenApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  return {
    notifications: notifications.data as KitchenNotification[] | undefined,
    isLoading: notifications.isLoading,
    unreadCount: notifications.data?.filter((n: KitchenNotification) => !n.read).length || 0,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['kitchen-notifications'] }),
  };
}

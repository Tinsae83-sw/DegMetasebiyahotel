import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '@/lib/kitchen/api';
import { toast } from 'sonner';
import type { Order } from '@/lib/kitchen/types';

export function useKitchenOrders(params?: { status?: string; station?: string; priority?: string }) {
  const queryClient = useQueryClient();

  const orders = useQuery({
    queryKey: ['kitchen-orders', params],
    queryFn: () => kitchenApi.getOrders(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const acceptOrderMutation = useMutation({
    mutationFn: ({ id, station }: { id: string; station?: string }) => 
      kitchenApi.acceptOrder(id, station),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
      toast.success('Order accepted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept order');
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      kitchenApi.rejectOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
      toast.success('Order rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    },
  });

  const startPreparingMutation = useMutation({
    mutationFn: (id: string) => kitchenApi.startPreparing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
      toast.success('Started preparing order');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start preparing');
    },
  });

  const markReadyMutation = useMutation({
    mutationFn: (id: string) => kitchenApi.markReady(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
      toast.success('Order marked as ready');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as ready');
    },
  });

  return {
    orders,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] }),
    acceptOrder: acceptOrderMutation.mutate,
    rejectOrder: rejectOrderMutation.mutate,
    startPreparing: startPreparingMutation.mutate,
    markReady: markReadyMutation.mutate,
    isAccepting: acceptOrderMutation.isPending,
    isRejecting: rejectOrderMutation.isPending,
    isPreparing: startPreparingMutation.isPending,
    isMarkingReady: markReadyMutation.isPending,
  };
}

export function useKitchenOrder(id: string) {
  const queryClient = useQueryClient();

  const order = useQuery({
    queryKey: ['kitchen-order', id],
    queryFn: () => kitchenApi.getOrderById(id),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => kitchenApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-order', id] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success('Order status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  return {
    order,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}

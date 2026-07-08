import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderApi } from "@/lib/api"
import type { CreateOrderData, UpdateOrderData } from "@/lib/api/orders"
import { toast } from "sonner"

export function useOrders(params?: { status?: string; paymentStatus?: string }) {
  const queryClient = useQueryClient()

  const orders = useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderApi.getAll(params),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateOrderData) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (error: any) => {
      console.error('Order creation error:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderData }) =>
      orderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Order updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update order")
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Order status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update order status")
    },
  })

  const processPaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { paymentMethod: string; amount: number; cashReceived?: number } }) =>
      orderApi.processPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Payment processed successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to process payment")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Order deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete order")
    },
  })

  return {
    orders,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    createOrder: createMutation.mutate,
    createOrderAsync: createMutation.mutateAsync,
    updateOrder: updateMutation.mutate,
    updateOrderStatus: updateStatusMutation.mutate,
    processPayment: processPaymentMutation.mutate,
    deleteOrder: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isProcessingPayment: processPaymentMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useOrder(id: string) {
  const queryClient = useQueryClient()

  const order = useQuery({
    queryKey: ["orders", id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => orderApi.updateStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Order status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update order status")
    },
  })

  return {
    order,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  }
}

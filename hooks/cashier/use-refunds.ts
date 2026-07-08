import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { refundsService } from '@/services/cashier'
import { toast } from 'sonner'
import type { Refund } from '@/types/cashier'

export const useRefunds = (params?: { page?: number; limit?: number; status?: string }) => {
  const queryClient = useQueryClient()

  const requestRefund = useMutation({
    mutationFn: (data: { transactionId: string; amount: number; reason: string }) =>
      refundsService.requestRefund(data),
    onSuccess: (data) => {
      toast.success('Refund requested successfully. Awaiting manager approval.')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'refunds'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'transactions'] })
    },
    onError: (error) => {
      toast.error('Failed to request refund')
    },
  })

  const getRefunds = useQuery({
    queryKey: ['cashier', 'refunds', params],
    queryFn: () => refundsService.getRefunds(params),
  })

  const getRefundById = (id: string) => {
    return useQuery({
      queryKey: ['cashier', 'refunds', id],
      queryFn: () => refundsService.getRefundById(id),
      enabled: !!id,
    })
  }

  const getRefundHistory = useQuery({
    queryKey: ['cashier', 'refunds', 'history'],
    queryFn: () => refundsService.getRefundHistory(),
  })

  const approveRefund = useMutation({
    mutationFn: (refundId: string) => refundsService.approveRefund(refundId),
    onSuccess: (data) => {
      toast.success('Refund approved successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'refunds'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'transactions'] })
    },
    onError: (error) => {
      toast.error('Failed to approve refund')
    },
  })

  const rejectRefund = useMutation({
    mutationFn: ({ refundId, reason }: { refundId: string; reason: string }) =>
      refundsService.rejectRefund(refundId, reason),
    onSuccess: (data) => {
      toast.success('Refund rejected successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'refunds'] })
    },
    onError: (error) => {
      toast.error('Failed to reject refund')
    },
  })

  return {
    requestRefund,
    getRefunds,
    getRefundById,
    getRefundHistory,
    approveRefund,
    rejectRefund,
  }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsService } from '@/services/cashier'
import { toast } from 'sonner'
import type { Payment } from '@/types/cashier'

export const usePayments = () => {
  const queryClient = useQueryClient()

  const processPayment = useMutation({
    mutationFn: (data: {
      orderId: string
      paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'chapa'
      amount: number
      cashReceived?: number
      cardDetails?: {
        cardNumber: string
        expiryDate: string
        cvv: string
      }
      chapaTransactionId?: string
    }) => paymentsService.processPayment(data),
    onSuccess: (data) => {
      toast.success('Payment processed successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'bills'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'analytics'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process payment')
    },
  })

  const getPaymentById = (id: string) => {
    return useQuery({
      queryKey: ['cashier', 'payments', id],
      queryFn: () => paymentsService.getPaymentById(id),
      enabled: !!id,
    })
  }

  const retryPayment = useMutation({
    mutationFn: (paymentId: string) => paymentsService.retryPayment(paymentId),
    onSuccess: (data) => {
      toast.success('Payment retried successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'payments', data.id] })
    },
    onError: (error) => {
      toast.error('Failed to retry payment')
    },
  })

  const cancelPayment = useMutation({
    mutationFn: (paymentId: string) => paymentsService.cancelPayment(paymentId),
    onSuccess: (data) => {
      toast.success('Payment cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'payments', data.id] })
    },
    onError: (error) => {
      toast.error('Failed to cancel payment')
    },
  })

  const getTodayPayments = useQuery({
    queryKey: ['cashier', 'payments', 'today'],
    queryFn: () => paymentsService.getTodayPayments(),
  })

  return {
    processPayment,
    getPaymentById,
    retryPayment,
    cancelPayment,
    getTodayPayments,
  }
}

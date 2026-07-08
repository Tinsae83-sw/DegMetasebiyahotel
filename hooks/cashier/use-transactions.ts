import { useQuery, useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '@/services/cashier'
import type { Transaction } from '@/types/cashier'

export const useTransactions = (params?: {
  page?: number
  limit?: number
  date?: string
  paymentMethod?: string
  cashier?: string
  status?: string
}) => {
  const queryClient = useQueryClient()

  const getTransactions = useQuery({
    queryKey: ['cashier', 'transactions', params],
    queryFn: () => transactionsService.getTransactions(params),
  })

  const getTransactionById = (id: string) => {
    return useQuery({
      queryKey: ['cashier', 'transactions', id],
      queryFn: () => transactionsService.getTransactionById(id),
      enabled: !!id,
    })
  }

  const searchTransactions = (query: string) => {
    return useQuery({
      queryKey: ['cashier', 'transactions', 'search', query],
      queryFn: () => transactionsService.searchTransactions(query),
      enabled: !!query,
    })
  }

  const getTodayTransactions = useQuery({
    queryKey: ['cashier', 'transactions', 'today'],
    queryFn: () => transactionsService.getTodayTransactions(),
  })

  const getTransactionsByDateRange = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ['cashier', 'transactions', 'range', startDate, endDate],
      queryFn: () => transactionsService.getTransactionsByDateRange(startDate, endDate),
      enabled: !!startDate && !!endDate,
    })
  }

  const refetchTransactions = () => {
    queryClient.invalidateQueries({ queryKey: ['cashier', 'transactions'] })
  }

  return {
    getTransactions,
    getTransactionById,
    searchTransactions,
    getTodayTransactions,
    getTransactionsByDateRange,
    refetchTransactions,
  }
}

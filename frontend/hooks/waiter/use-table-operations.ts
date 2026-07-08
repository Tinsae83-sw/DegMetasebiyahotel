import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { TableTransfer } from '@/types/waiter'
import { toast } from 'sonner'

export function useTableOperations() {
  const queryClient = useQueryClient()

  const assignCustomer = useMutation({
    mutationFn: async ({ tableId, customerId }: { tableId: string; customerId: string }) => {
      const response = await apiClient.post(`/tables/${tableId}/assign`, { customerId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Customer assigned to table')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign customer')
    },
  })

  const releaseTable = useMutation({
    mutationFn: async (tableId: string) => {
      const response = await apiClient.post(`/tables/${tableId}/release`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table released')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to release table')
    },
  })

  const transferTable = useMutation({
    mutationFn: async (data: TableTransfer) => {
      const response = await apiClient.post('/tables/transfer', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Table transferred successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to transfer table')
    },
  })

  const mergeTables = useMutation({
    mutationFn: async ({ sourceTableIds, destinationTableId }: { sourceTableIds: string[]; destinationTableId: string }) => {
      const response = await apiClient.post('/tables/merge', { sourceTableIds, destinationTableId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Tables merged successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to merge tables')
    },
  })

  const splitTable = useMutation({
    mutationFn: async ({ tableId, splitCount }: { tableId: string; splitCount: number }) => {
      const response = await apiClient.post('/tables/split', { tableId, splitCount })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Table split successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to split table')
    },
  })

  return {
    assignCustomer,
    releaseTable,
    transferTable,
    mergeTables,
    splitTable,
  }
}

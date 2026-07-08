import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { CustomerRequest, RequestType, RequestStatus } from '@/types/waiter'
import { toast } from 'sonner'

export function useCustomerRequests() {
  const queryClient = useQueryClient()

  const requests = useQuery({
    queryKey: ['customer-requests'],
    queryFn: async () => {
      const response = await apiClient.get('/customer-requests')
      return response.data as CustomerRequest[]
    },
  })

  const updateRequest = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomerRequest> }) => {
      const response = await apiClient.patch(`/customer-requests/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] })
      toast.success('Request updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update request')
    },
  })

  const acceptRequest = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/customer-requests/${id}`, { status: 'accepted' })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] })
      toast.success('Request accepted')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept request')
    },
  })

  const completeRequest = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/customer-requests/${id}`, { 
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] })
      toast.success('Request completed')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete request')
    },
  })

  const ignoreRequest = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/customer-requests/${id}`, { status: 'ignored' })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] })
      toast.success('Request ignored')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to ignore request')
    },
  })

  return {
    requests,
    updateRequest,
    acceptRequest,
    completeRequest,
    ignoreRequest,
  }
}

export function useCustomerRequestsByTable(tableId: string) {
  return useQuery({
    queryKey: ['customer-requests', tableId],
    queryFn: async () => {
      const response = await apiClient.get(`/customer-requests/table/${tableId}`)
      return response.data as CustomerRequest[]
    },
    enabled: !!tableId,
  })
}

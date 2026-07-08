import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { Notification } from '@/types/waiter'
import { toast } from 'sonner'

export function useWaiterNotifications() {
  const queryClient = useQueryClient()

  const notifications = useQuery({
    queryKey: ['waiter-notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/waiter/notifications')
      return response.data as Notification[]
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/waiter/notifications/${id}/read`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-notifications'] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch('/waiter/notifications/read-all')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-notifications'] })
      toast.success('All notifications marked as read')
    },
  })

  const unreadCount = notifications.data?.filter(n => !n.read).length || 0

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  }
}

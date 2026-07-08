import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/services/cashier'
import { toast } from 'sonner'
import type { CashierNotification } from '@/types/cashier'

export const useNotifications = () => {
  const queryClient = useQueryClient()

  const getNotifications = useQuery({
    queryKey: ['cashier', 'notifications'],
    queryFn: () => notificationsService.getNotifications(),
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  const getUnreadNotifications = useQuery({
    queryKey: ['cashier', 'notifications', 'unread'],
    queryFn: () => notificationsService.getUnreadNotifications(),
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashier', 'notifications'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'notifications', 'unread'] })
    },
    onError: (error) => {
      toast.error('Failed to mark notification as read')
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashier', 'notifications'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'notifications', 'unread'] })
      toast.success('All notifications marked as read')
    },
    onError: (error) => {
      toast.error('Failed to mark all notifications as read')
    },
  })

  const deleteNotification = useMutation({
    mutationFn: (notificationId: string) => notificationsService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashier', 'notifications'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'notifications', 'unread'] })
      toast.success('Notification deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete notification')
    },
  })

  return {
    getNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { WaiterStats } from '@/types/waiter'

export function useWaiterStats() {
  return useQuery({
    queryKey: ['waiter-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/waiter/stats')
      return response.data as WaiterStats
    },
  })
}

export function useWaiterDailyPerformance(date?: Date) {
  const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['waiter-performance', dateStr],
    queryFn: async () => {
      const response = await apiClient.get(`/waiter/performance?date=${dateStr}`)
      return response.data
    },
  })
}

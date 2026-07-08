import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/cashier'
import type { SalesAnalytics, CashierDashboardStats } from '@/types/cashier'

export const useAnalytics = () => {
  const getDashboardStats = useQuery({
    queryKey: ['cashier', 'analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const getSalesAnalytics = (period?: 'today' | 'week' | 'month' | 'year') => {
    return useQuery({
      queryKey: ['cashier', 'analytics', 'sales', period],
      queryFn: () => analyticsService.getSalesAnalytics(period),
      refetchInterval: 60000, // Refetch every minute
    })
  }

  const getRevenueTrend = (period: 'daily' | 'weekly' | 'monthly') => {
    return useQuery({
      queryKey: ['cashier', 'analytics', 'revenue-trend', period],
      queryFn: () => analyticsService.getRevenueTrend(period),
    })
  }

  const getPaymentMethodStats = (period?: 'today' | 'week' | 'month' | 'year') => {
    return useQuery({
      queryKey: ['cashier', 'analytics', 'payment-methods', period],
      queryFn: () => analyticsService.getPaymentMethodStats(period),
    })
  }

  const getTopSellingItems = (limit: number = 10) => {
    return useQuery({
      queryKey: ['cashier', 'analytics', 'top-items', limit],
      queryFn: () => analyticsService.getTopSellingItems(limit),
    })
  }

  const getPeakSalesHours = useQuery({
    queryKey: ['cashier', 'analytics', 'peak-hours'],
    queryFn: () => analyticsService.getPeakSalesHours(),
  })

  const getTransactionsPerDay = (days: number = 7) => {
    return useQuery({
      queryKey: ['cashier', 'analytics', 'transactions-per-day', days],
      queryFn: () => analyticsService.getTransactionsPerDay(days),
    })
  }

  return {
    getDashboardStats,
    getSalesAnalytics,
    getRevenueTrend,
    getPaymentMethodStats,
    getTopSellingItems,
    getPeakSalesHours,
    getTransactionsPerDay,
  }
}

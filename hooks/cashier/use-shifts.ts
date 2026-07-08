import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shiftsService } from '@/services/cashier'
import { toast } from 'sonner'
import type { Shift } from '@/types/cashier'

export const useShifts = () => {
  const queryClient = useQueryClient()

  const startShift = useMutation({
    mutationFn: (data: { openingCash: number }) => shiftsService.startShift(data),
    onSuccess: (data) => {
      toast.success('Shift started successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'shifts'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'shifts', 'current'] })
    },
    onError: (error) => {
      toast.error('Failed to start shift')
    },
  })

  const endShift = useMutation({
    mutationFn: ({ shiftId, closingCash }: { shiftId: string; closingCash: number }) =>
      shiftsService.endShift(shiftId, { closingCash }),
    onSuccess: (data) => {
      toast.success('Shift ended successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'shifts'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'shifts', 'current'] })
    },
    onError: (error) => {
      toast.error('Failed to end shift')
    },
  })

  const getCurrentShift = useQuery({
    queryKey: ['cashier', 'shifts', 'current'],
    queryFn: () => shiftsService.getCurrentShift(),
    retry: false,
  })

  const getShiftById = (id: string) => {
    return useQuery({
      queryKey: ['cashier', 'shifts', id],
      queryFn: () => shiftsService.getShiftById(id),
      enabled: !!id,
    })
  }

  const getShiftHistory = (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
    return useQuery({
      queryKey: ['cashier', 'shifts', 'history', params],
      queryFn: () => shiftsService.getShiftHistory(params),
    })
  }

  const generateShiftReport = useMutation({
    mutationFn: (shiftId: string) => shiftsService.generateShiftReport(shiftId),
    onSuccess: (data) => {
      toast.success('Shift report generated successfully')
      window.open(data.reportUrl, '_blank')
    },
    onError: (error) => {
      toast.error('Failed to generate shift report')
    },
  })

  return {
    startShift,
    endShift,
    getCurrentShift,
    getShiftById,
    getShiftHistory,
    generateShiftReport,
  }
}

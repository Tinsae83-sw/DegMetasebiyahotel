import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billsService } from '@/services/cashier'
import { toast } from 'sonner'
import type { Bill } from '@/types/cashier'

export const useBills = () => {
  const queryClient = useQueryClient()

  const getPendingBills = useQuery({
    queryKey: ['cashier', 'bills', 'pending'],
    queryFn: () => billsService.getPendingBills(),
  })

  const getBillById = (id: string) => {
    return useQuery({
      queryKey: ['cashier', 'bills', id],
      queryFn: () => billsService.getBillById(id),
      enabled: !!id,
    })
  }

  const generateInvoice = useMutation({
    mutationFn: ({ billId }: { billId: string }) => billsService.generateInvoice(billId),
    onSuccess: (data) => {
      toast.success('Invoice generated successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'bills'] })
    },
    onError: (error) => {
      toast.error('Failed to generate invoice')
    },
  })

  const applyDiscount = useMutation({
    mutationFn: ({ billId, discount }: { billId: string; discount: { type: 'percentage' | 'fixed'; value: number; reason: string } }) =>
      billsService.applyDiscount(billId, discount),
    onSuccess: (data) => {
      toast.success('Discount applied successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'bills'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'bills', data.id] })
    },
    onError: (error) => {
      toast.error('Failed to apply discount')
    },
  })

  const removeDiscount = useMutation({
    mutationFn: (billId: string) => billsService.removeDiscount(billId),
    onSuccess: (data) => {
      toast.success('Discount removed successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'bills'] })
      queryClient.invalidateQueries({ queryKey: ['cashier', 'bills', data.id] })
    },
    onError: (error) => {
      toast.error('Failed to remove discount')
    },
  })

  return {
    getPendingBills,
    getBillById,
    generateInvoice,
    applyDiscount,
    removeDiscount,
  }
}

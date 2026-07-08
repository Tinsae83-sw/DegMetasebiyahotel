import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { receiptsService } from '@/services/cashier'
import { toast } from 'sonner'
import type { Receipt } from '@/types/cashier'

export const useReceipts = () => {
  const queryClient = useQueryClient()

  const generateReceipt = useMutation({
    mutationFn: (paymentId: string) => receiptsService.generateReceipt(paymentId),
    onSuccess: (data) => {
      toast.success('Receipt generated successfully')
      queryClient.invalidateQueries({ queryKey: ['cashier', 'receipts'] })
    },
    onError: (error) => {
      toast.error('Failed to generate receipt')
    },
  })

  const getReceiptById = (id: string) => {
    return useQuery({
      queryKey: ['cashier', 'receipts', id],
      queryFn: () => receiptsService.getReceiptById(id),
      enabled: !!id,
    })
  }

  const getReceiptByOrder = (orderId: string) => {
    return useQuery({
      queryKey: ['cashier', 'receipts', 'order', orderId],
      queryFn: () => receiptsService.getReceiptByOrder(orderId),
      enabled: !!orderId,
    })
  }

  const printReceipt = useMutation({
    mutationFn: (receiptId: string) => receiptsService.printReceipt(receiptId),
    onSuccess: () => {
      toast.success('Receipt sent to printer')
    },
    onError: (error) => {
      toast.error('Failed to print receipt')
    },
  })

  const downloadReceipt = useMutation({
    mutationFn: (receiptId: string) => receiptsService.downloadReceipt(receiptId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `receipt-${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Receipt downloaded successfully')
    },
    onError: (error) => {
      toast.error('Failed to download receipt')
    },
  })

  const emailReceipt = useMutation({
    mutationFn: ({ receiptId, email }: { receiptId: string; email: string }) =>
      receiptsService.emailReceipt(receiptId, email),
    onSuccess: () => {
      toast.success('Receipt emailed successfully')
    },
    onError: (error) => {
      toast.error('Failed to email receipt')
    },
  })

  const reprintReceipt = useMutation({
    mutationFn: (receiptId: string) => receiptsService.reprintReceipt(receiptId),
    onSuccess: () => {
      toast.success('Receipt reprinted successfully')
    },
    onError: (error) => {
      toast.error('Failed to reprint receipt')
    },
  })

  return {
    generateReceipt,
    getReceiptById,
    getReceiptByOrder,
    printReceipt,
    downloadReceipt,
    emailReceipt,
    reprintReceipt,
  }
}

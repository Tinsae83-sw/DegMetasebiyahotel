import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tableApi } from "@/lib/api"
import type { CreateTableData, UpdateTableData } from "@/lib/api/tables"
import { toast } from "sonner"

export function useTables() {
  const queryClient = useQueryClient()

  const tables = useQuery({
    queryKey: ["tables"],
    queryFn: tableApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTableData) => tableApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success("Table created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create table")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableData }) =>
      tableApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success("Table updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update table")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tableApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success("Table deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete table")
    },
  })

  const generateQRMutation = useMutation({
    mutationFn: (id: string) => tableApi.generateQR(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success("QR code generated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate QR code")
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      tableApi.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success("Table status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update table status")
    },
  })

  const assignWaiterMutation = useMutation({
    mutationFn: ({ id, waiterId }: { id: string; waiterId: string }) =>
      tableApi.assignWaiter(id, waiterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success("Waiter assigned successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign waiter")
    },
  })

  const removeWaiterMutation = useMutation({
    mutationFn: (id: string) => tableApi.removeWaiter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success("Waiter removed successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove waiter")
    },
  })

  return {
    tables,
    createTable: createMutation.mutate,
    updateTable: updateMutation.mutate,
    deleteTable: deleteMutation.mutate,
    generateQR: generateQRMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    assignWaiter: assignWaiterMutation.mutate,
    removeWaiter: removeWaiterMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isGeneratingQR: generateQRMutation.isPending,
    isAssigningWaiter: assignWaiterMutation.isPending,
    isRemovingWaiter: removeWaiterMutation.isPending,
  }
}

export function useTable(id: string) {
  return useQuery({
    queryKey: ["tables", id],
    queryFn: () => tableApi.getById(id),
    enabled: !!id,
  })
}

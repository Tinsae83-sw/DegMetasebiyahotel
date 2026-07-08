import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { staffApi } from "@/lib/api"
import type { CreateStaffData, UpdateStaffData } from "@/lib/api/staff"
import { toast } from "sonner"

export function useStaff(params?: { role?: "admin" | "cashier" | "waiter" | "kitchen"; isActive?: boolean }) {
  const queryClient = useQueryClient()

  const staff = useQuery({
    queryKey: ["staff", params],
    queryFn: () => staffApi.getAll(params),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateStaffData) => staffApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast.success(data.message || "Staff member created successfully. Password has been sent to their email.")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create staff member")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffData }) =>
      staffApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast.success("Staff member updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update staff member")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => staffApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast.success("Staff member deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete staff member")
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      staffApi.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast.success("Staff status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update staff status")
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => staffApi.resetPassword(id),
    onSuccess: (data) => {
      toast.success(data.message || "Password reset email sent successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset password")
    },
  })

  return {
    staff,
    createStaff: createMutation.mutate,
    updateStaff: updateMutation.mutate,
    deleteStaff: deleteMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  }
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: () => staffApi.getById(id),
    enabled: !!id,
  })
}

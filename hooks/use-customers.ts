import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { customerApi } from "@/lib/api"
import type { CreateCustomerData, UpdateCustomerData } from "@/lib/api/customers"
import { toast } from "sonner"

export function useCustomers(params?: { tier?: "bronze" | "silver" | "gold" | "platinum"; search?: string }) {
  const queryClient = useQueryClient()

  const customers = useQuery({
    queryKey: ["customers", params],
    queryFn: () => customerApi.getAll(params),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerData) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create customer")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerData }) =>
      customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update customer")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete customer")
    },
  })

  const addLoyaltyPointsMutation = useMutation({
    mutationFn: ({ id, points }: { id: string; points: number }) =>
      customerApi.addLoyaltyPoints(id, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Loyalty points added successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add loyalty points")
    },
  })

  return {
    customers,
    createCustomer: createMutation.mutate,
    updateCustomer: updateMutation.mutate,
    deleteCustomer: deleteMutation.mutate,
    addLoyaltyPoints: addLoyaltyPointsMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useCustomer(id: string) {
  const queryClient = useQueryClient()

  const customer = useQuery({
    queryKey: ["customers", id],
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  })

  const getOrderHistory = useQuery({
    queryKey: ["customers", id, "orders"],
    queryFn: () => customerApi.getOrderHistory(id),
    enabled: !!id,
  })

  return {
    customer,
    orderHistory: getOrderHistory,
  }
}

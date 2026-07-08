import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { menuApi } from "@/lib/api"
import type { CreateMenuItemData, UpdateMenuItemData } from "@/lib/api/menu"
import { toast } from "sonner"

export function useMenuItems(params?: { categoryId?: string; availableOnly?: boolean }) {
  const queryClient = useQueryClient()

  const menuItems = useQuery({
    queryKey: ["menu-items", params],
    queryFn: () => menuApi.getAll(params),
  })

  const createMutation = useMutation({
    mutationFn: ({ data, imageFile }: { data: CreateMenuItemData; imageFile?: File }) => 
      menuApi.create(data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      toast.success("Menu item created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create menu item")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data, imageFile }: { id: string; data: UpdateMenuItemData; imageFile?: File }) =>
      menuApi.update(id, data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      toast.success("Menu item updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update menu item")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      toast.success("Menu item deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete menu item")
    },
  })

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuApi.toggleAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      toast.success("Availability updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update availability")
    },
  })

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      menuApi.toggleFeatured(id, isFeatured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      toast.success("Featured status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update featured status")
    },
  })

  return {
    menuItems,
    createMenuItem: createMutation.mutate,
    updateMenuItem: updateMutation.mutate,
    deleteMenuItem: deleteMutation.mutate,
    toggleAvailability: toggleAvailabilityMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useMenuItem(id: string) {
  return useQuery({
    queryKey: ["menu-items", id],
    queryFn: () => menuApi.getById(id),
    enabled: !!id,
  })
}

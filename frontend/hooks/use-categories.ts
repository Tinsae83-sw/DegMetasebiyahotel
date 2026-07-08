import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoryApi } from "@/lib/api"
import type { CreateCategoryData, UpdateCategoryData } from "@/lib/api/categories"
import { toast } from "sonner"

export function useCategories() {
  const queryClient = useQueryClient()

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryData) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update category")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category")
    },
  })

  return {
    categories,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  })
}

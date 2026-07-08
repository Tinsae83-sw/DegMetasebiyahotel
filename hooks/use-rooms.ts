import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { roomApi } from "@/lib/api"
import type { CreateRoomData, UpdateRoomData } from "@/lib/api/rooms"
import { toast } from "sonner"

export function useRooms() {
  const queryClient = useQueryClient()

  const rooms = useQuery({
    queryKey: ["rooms"],
    queryFn: roomApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateRoomData) => roomApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast.success("Room created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create room")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomData }) =>
      roomApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast.success("Room updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update room")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast.success("Room deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete room")
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      roomApi.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast.success("Room status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update room status")
    },
  })

  const generateQRMutation = useMutation({
    mutationFn: (id: string) => roomApi.generateQR(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast.success("QR code generated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate QR code")
    },
  })

  const assignWaiterMutation = useMutation({
    mutationFn: ({ id, waiterId }: { id: string; waiterId: string }) =>
      roomApi.assignWaiter(id, waiterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast.success("Waiter assigned successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign waiter")
    },
  })

  const removeWaiterMutation = useMutation({
    mutationFn: (id: string) => roomApi.removeWaiter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast.success("Waiter removed successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove waiter")
    },
  })

  return {
    rooms,
    createRoom: createMutation.mutate,
    updateRoom: updateMutation.mutate,
    deleteRoom: deleteMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    generateQR: generateQRMutation.mutate,
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

export function useRoom(id: string) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: () => roomApi.getById(id),
    enabled: !!id,
  })
}

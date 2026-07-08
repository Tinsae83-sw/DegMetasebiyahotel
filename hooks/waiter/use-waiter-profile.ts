import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { WaiterProfile } from '@/types/waiter'
import { toast } from 'sonner'
import { waiterProfileSchema, passwordChangeSchema } from '@/lib/validations/waiter'

export function useWaiterProfile() {
  const queryClient = useQueryClient()

  const profile = useQuery({
    queryKey: ['waiter-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/waiter/profile')
      return response.data as WaiterProfile
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<WaiterProfile>) => {
      const validated = waiterProfileSchema.parse(data)
      const response = await apiClient.patch('/waiter/profile', validated)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const changePassword = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const validated = passwordChangeSchema.parse(data)
      const response = await apiClient.post('/waiter/change-password', {
        currentPassword: validated.currentPassword,
        newPassword: validated.newPassword,
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    },
  })

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await apiClient.post('/waiter/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Avatar uploaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    },
  })

  return {
    profile,
    updateProfile,
    changePassword,
    uploadAvatar,
  }
}

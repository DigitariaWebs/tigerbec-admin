"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admins"
import { Admin } from "@/types"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { toast } from "sonner"
import type { AdminFormValues } from "./components/admin-form-dialog"
import type { AdminEditFormValues } from "./components/admin-edit-modal"

export default function AdminsPage() {
  const queryClient = useQueryClient()

  // Fetch all admins
  const { data: admins = [], isLoading, error } = useQuery<Admin[]>({
    queryKey: ['admins'],
    queryFn: () => adminApi.list(),
  })

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: (data: { fullName: string; email: string; phoneNumber: string; password: string; role?: 'admin' | 'super_admin' }) => 
      adminApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Admin created successfully')
    },
    onError: (error: Error) => {
      const errorMessage = error.message.toLowerCase()
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists') || errorMessage.includes('unique')) {
        if (errorMessage.includes('email')) {
          toast.error('An admin with this email already exists')
        } else {
          toast.error('This admin already exists')
        }
      } else {
        toast.error(`Failed to create admin: ${error.message}`)
      }
    },
  })

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Admin deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete admin: ${error.message}`)
    },
  })

  // Update admin mutation
  const updateAdminMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Admin, 'full_name' | 'email'>> }) => 
      adminApi.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Admin updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update admin: ${error.message}`)
    },
  })

  // Modify admin mutation (using PATCH)
  const modifyAdminMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminEditFormValues }) => 
      adminApi.modify(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Admin updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update admin: ${error.message}`)
    },
  })

  const handleAddAdmin = async (data: AdminFormValues) => {
    // Map form fields to backend field names
    await createAdminMutation.mutateAsync({
      fullName: data.full_name,
      email: data.email,
      phoneNumber: data.phone,
      password: data.password,
      role: data.role,
    })
  }

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      deleteAdminMutation.mutate(id)
    }
  }

  const handleEditAdmin = (admin: Admin) => {
    // This will be handled by the data table's edit dialog
    console.log("Edit admin:", admin)
  }

  const handleModifyAdmin = async (id: string, data: AdminEditFormValues) => {
    await modifyAdminMutation.mutateAsync({ id, data })
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
          <h3 className="font-semibold">Error loading admins</h3>
          <p className="text-sm">{error instanceof Error ? error.message : 'An error occurred'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards admins={admins} isLoading={isLoading} />
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable 
          admins={admins}
          isLoading={isLoading}
          onAddAdmin={handleAddAdmin}
          onDeleteAdmin={handleDeleteAdmin}
          onEditAdmin={handleEditAdmin}
          onUpdateAdmin={(id, data) => updateAdminMutation.mutate({ id, data })}
          onModifyAdmin={handleModifyAdmin}
        />
      </div>
    </div>
  )
}

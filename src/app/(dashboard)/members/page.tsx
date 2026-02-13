"use client"

import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { toast } from "sonner"
import { membersApi } from "@/lib/api/members"
import type { MemberEditFormValues } from "./components/member-edit-modal"

interface User {
  user_id: string
  name: string
  date_of_birth: string
  email: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface UserFormValues {
  name: string
  email: string
  date_of_birth: string
  password: string
  phone?: string
  avatar_url?: string
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["members", { page, limit, search }],
    queryFn: () =>
      membersApi.list({
        page,
        limit,
        search: search || undefined,
        sortBy: "newest",
      }),
    staleTime: 30000,
  })

  const users = useMemo<User[]>(() => {
    const members = data?.data || []
    return members.map((member) => ({
      user_id: member.user_id || member.id || "",
      name: member.name || "Unknown User",
      date_of_birth: member.date_of_birth,
      email: member.email || "",
      phone: member.phone || "",
      avatar_url: "",
      created_at: member.created_at,
      updated_at: member.updated_at,
    }))
  }, [data])

  const pagination = data?.pagination || {
    page,
    limit,
    total: 0,
    totalPages: 1,
    from: 0,
    to: 0,
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit)
    setPage(1)
  }

  const handleAddUser = async (userData: UserFormValues) => {
    try {
      await membersApi.create({
        name: userData.name,
        email: userData.email,
        dateOfBirth: userData.date_of_birth,
        password: userData.password,
        phone: userData.phone,
      })

      toast.success("Member created successfully")
      setPage(1)
      await queryClient.invalidateQueries({ queryKey: ["members"] })
    } catch (error) {
      console.error("Failed to create member:", error)
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : ""

      if (errorMessage.includes("duplicate") || errorMessage.includes("already exists") || errorMessage.includes("unique")) {
        if (errorMessage.includes("email")) {
          toast.error("A member with this email already exists")
        } else if (errorMessage.includes("phone")) {
          toast.error("A member with this phone number already exists")
        } else {
          toast.error("This member already exists")
        }
      } else {
        toast.error(`Failed to create member: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
      throw error
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await membersApi.delete(userId)
      toast.success("Member deleted successfully")
      await queryClient.invalidateQueries({ queryKey: ["members"] })
    } catch (error) {
      console.error("Failed to delete member:", error)
      toast.error(`Failed to delete member: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleEditUser = (user: User) => {
    console.log("Edit user:", user)
  }

  const handleModifyMember = async (id: string, memberData: MemberEditFormValues) => {
    try {
      await membersApi.modify(id, memberData)
      toast.success("Member updated successfully")
      await queryClient.invalidateQueries({ queryKey: ["members"] })
    } catch (error) {
      console.error("Failed to update member:", error)
      toast.error(`Failed to update member: ${error instanceof Error ? error.message : "Unknown error"}`)
      throw error
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards />
      </div>

      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable
          users={users}
          pagination={pagination}
          search={search}
          isLoading={isLoading}
          onSearchChange={handleSearchChange}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
          onModifyMember={handleModifyMember}
        />
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { toast } from "sonner"
import { membersApi } from "@/lib/api/members"
import type { MemberStats } from "@/types"
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
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await membersApi.getAll()
        const mappedUsers = members.map((member) => ({
          user_id: member.user_id || member.id || "",
          name: member.name || "Unknown User",
          date_of_birth: member.date_of_birth,
          email: member.email || "",
          phone: member.phone || "",
          avatar_url: "",
          created_at: member.created_at,
          updated_at: member.updated_at,
        }))
        setUsers(mappedUsers)
      } catch (error) {
        console.error("Failed to fetch members:", error)
      }
    }
    fetchMembers()
  }, [])



  const handleAddUser = async (userData: UserFormValues) => {
    try {
      // Call the API to create the member
      const createdMember = await membersApi.create({
        name: userData.name,
        email: userData.email,
        dateOfBirth: userData.date_of_birth,
        password: userData.password,
        phone: userData.phone,
      })

      // Add the new member to the local state
      const newUser: User = {
        user_id: createdMember.user_id || createdMember.id || Date.now().toString(),
        name: createdMember.full_name || '',
        date_of_birth: createdMember.date_of_birth,
        email: createdMember.email || '',
        phone: undefined,
        avatar_url: undefined,
        created_at: createdMember.created_at || new Date().toISOString(),
        updated_at: createdMember.updated_at || new Date().toISOString(),
      }
      setUsers(prev => [newUser, ...prev])
      toast.success('Member created successfully')
    } catch (error) {
      console.error("Failed to create member:", error)
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : ''
      
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists') || errorMessage.includes('unique')) {
        if (errorMessage.includes('email')) {
          toast.error('A member with this email already exists')
        } else if (errorMessage.includes('phone')) {
          toast.error('A member with this phone number already exists')
        } else {
          toast.error('This member already exists')
        }
      } else {
        toast.error(`Failed to create member: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      throw error
    }
  }

  const handleDeleteUser = async (user_id: string) => {
    try {
      await membersApi.delete(user_id)
      setUsers(prev => prev.filter(user => user.user_id !== user_id))
      toast.success('Member deleted successfully')
    } catch (error) {
      console.error("Failed to delete member:", error)
      toast.error(`Failed to delete member: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditUser = (user: User) => {
    // For now, just log the user to edit
    // In a real app, you'd open an edit dialog
    console.log("Edit user:", user)
  }

  const handleModifyMember = async (id: string, data: MemberEditFormValues) => {
    try {
      await membersApi.modify(id, data)
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === id 
          ? { ...user, ...data, updated_at: new Date().toISOString() }
          : user
      ))
      
      toast.success('Member updated successfully')
    } catch (error) {
      console.error("Failed to update member:", error)
      toast.error(`Failed to update member: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
          onModifyMember={handleModifyMember}
        />
      </div>
    </div>
  )
}

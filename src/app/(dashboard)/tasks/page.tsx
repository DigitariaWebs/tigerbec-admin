"use client"

import { useEffect, useState } from "react"

import { getColumns } from "./components/columns"
import { DataTable } from "./components/data-table"
import type { Task } from "./data/schema"
import { tasksApi } from "@/lib/api/tasks"
import { membersApi } from "@/lib/api/members"

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const [fetchedTasks, members] = await Promise.all([
        tasksApi.getAllTasks(),
        membersApi.getAll(),
      ])

      const memberNames = new Map<string, string>()
      members.forEach((member) => {
        if (member.user_id) {
          memberNames.set(member.user_id, member.name || "Unknown")
        }
      })
      
      const tasksWithLabel = fetchedTasks.map(task => ({
        ...task,
        label: task.priority.toLowerCase() === 'urgent' ? 'bug' : 'feature',
        member_name: memberNames.get(task.member_id) || "Unknown",
      }))
      
      setTasks(tasksWithLabel)
      setError(null)
    } catch (error) {
      console.error("Failed to load tasks:", error)
      setError(error instanceof Error ? error.message : "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = () => {
    loadTasks() // Reload tasks after adding
  }

  const handleUpdateTask = () => {
    loadTasks() // Reload tasks after updating
  }

  const handleDeleteTask = () => {
    loadTasks() // Reload tasks after deleting
  }

  // Get columns with callbacks
  const columns = getColumns(handleUpdateTask, handleDeleteTask)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-destructive">Error: {error}</div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile view placeholder - shows message instead of images */}
      <div className="md:hidden">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Tasks Dashboard</h3>
            <p className="text-muted-foreground">
              Please use a larger screen to view the full tasks interface.
            </p>
          </div>
        </div>
      </div>
      
      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col px-4 md:px-6 md:flex">
        <DataTable 
          data={tasks} 
          columns={columns} 
          onAddTask={handleAddTask}
        />
      </div>
    </>
  )
}

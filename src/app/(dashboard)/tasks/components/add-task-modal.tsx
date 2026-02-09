"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { priorities, statuses } from "../data/data"
import type { Task } from "../data/schema"
import { tasksApi, type CreateTaskDto } from "@/lib/api/tasks"
import { membersApi } from "@/lib/api/members"

interface AddTaskModalProps {
  onAddTask?: (task: Task) => void
  trigger?: React.ReactNode
}

export function AddTaskModal({ onAddTask, trigger }: AddTaskModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    member_id: "",
    title: "",
    description: "",
    status: "TODO" as Task["status"],
    label: "feature",
    priority: "MEDIUM" as Task["priority"],
    due_date: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const membersData = await membersApi.getAll()
        const options = membersData
          .filter((member) => member.user_id)
          .map((member) => ({
            id: member.user_id as string,
            name: member.name || "Unknown",
          }))
        setMembers(options)
      } catch (error) {
        console.error("Failed to load members for task assignment:", error)
      }
    }

    if (open) {
      loadMembers()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setErrors({ title: "Title is required" })
      return
    }

    if (!formData.member_id) {
      setErrors({ member_id: "Assigned member is required" })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const createData: CreateTaskDto = {
        member_id: formData.member_id,
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
      }

      await tasksApi.createTask(createData)
      
      // Notify parent component to reload tasks
      onAddTask?.({} as Task)
      
      // Reset form and close modal
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error("Failed to create task:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Failed to create task" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      member_id: "",
      title: "",
      description: "",
      status: "TODO",
      label: "feature",
      priority: "MEDIUM",
      due_date: "",
    })
    setErrors({})
  }

  const handleCancel = () => {
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task to track work and progress. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="text-sm text-red-500">{errors.submit}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="member_id">Assign To Member *</Label>
            <Select
              value={formData.member_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, member_id: value }))
              }
            >
              <SelectTrigger className={errors.member_id ? "border-red-500" : ""}>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.member_id && (
              <p className="text-sm text-red-500">{errors.member_id}</p>
            )}
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the task..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Task Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Task["status"] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center">
                      {status.icon && (
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="Enter task label (e.g., Sales, Support, Marketing)..."
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>

          {/* Task Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task["priority"] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center">
                      {priority.icon && (
                        <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      {priority.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} className="cursor-pointer" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { format } from "date-fns"
import { Calendar, Clock, Flag, Tag, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import type { Task } from "../data/schema"
import { priorities, statuses } from "../data/data"

interface TaskDetailsModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailsModal({ task, open, onOpenChange }: TaskDetailsModalProps) {
  if (!task) return null

  const status = statuses.find((s) => s.value === task.status)
  const priority = priorities.find((p) => p.value === task.priority)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{task.title}</DialogTitle>
          <DialogDescription>
            View task details and information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status and Priority Row */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flag className="h-4 w-4" />
                <span className="font-medium">Status</span>
              </div>
              <div className="flex items-center gap-2">
                {status?.icon && <status.icon className="h-4 w-4 text-muted-foreground" />}
                <span className="font-medium">{status?.label}</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flag className="h-4 w-4" />
                <span className="font-medium">Priority</span>
              </div>
              <div className="flex items-center gap-2">
                {priority?.icon && <priority.icon className="h-4 w-4 text-muted-foreground" />}
                <span className="font-medium">{priority?.label}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Label */}
          {task.label && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Label</span>
              </div>
              <Badge variant="outline">{task.label}</Badge>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Description</div>
                <p className="text-sm leading-relaxed">{task.description}</p>
              </div>
            </>
          )}

          {/* Due Date */}
          {task.due_date && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Due Date</span>
                </div>
                <p className="text-sm">
                  {format(new Date(task.due_date), "MMMM d, yyyy")}
                </p>
              </div>
            </>
          )}

          {/* Completed Date */}
          {task.completed_at && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Completed At</span>
                </div>
                <p className="text-sm">
                  {format(new Date(task.completed_at), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {format(new Date(task.created_at), "MMM d, yyyy")}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{" "}
              {format(new Date(task.updated_at), "MMM d, yyyy")}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

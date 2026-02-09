import { z } from "zod"

// Task schema matching backend API
export const taskSchema = z.object({
  id: z.string(),
  member_id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  due_date: z.string().optional().nullable(),
  completed_at: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  member_name: z.string().optional(),
  // Legacy fields for compatibility with old UI
  label: z.string().optional(),
})

export type Task = z.infer<typeof taskSchema>

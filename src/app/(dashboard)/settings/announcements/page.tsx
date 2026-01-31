"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { announcementsApi, Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from "@/lib/api/announcements"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Megaphone, AlertCircle, Trophy, Bell } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"

const typeIcons = {
  general: Bell,
  incentive: Trophy,
  alert: AlertCircle,
  celebration: Megaphone,
}

const typeColors = {
  general: "bg-blue-500/10 text-blue-500",
  incentive: "bg-green-500/10 text-green-500",
  alert: "bg-red-500/10 text-red-500",
  celebration: "bg-purple-500/10 text-purple-500",
}

const priorityColors = {
  low: "bg-gray-500",
  normal: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
}

export default function AnnouncementsPage() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateAnnouncementDto>({
    title: "",
    content: "",
    type: "general",
    priority: "normal",
    is_active: true,
    expires_at: "",
  })

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementsApi.list(),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAnnouncementDto) => announcementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
      toast.success("Announcement created successfully")
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create announcement"
      toast.error(message)
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementDto }) =>
      announcementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
      toast.success("Announcement updated successfully")
      setEditingAnnouncement(null)
      resetForm()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update announcement"
      toast.error(message)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
      toast.success("Announcement deleted successfully")
      setDeleteId(null)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete announcement"
      toast.error(message)
    },
  })

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "general",
      priority: "normal",
      is_active: true,
      expires_at: "",
    })
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      is_active: announcement.is_active,
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : "",
    })
  }

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      expires_at: formData.expires_at || undefined,
    }

    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-2">
            Manage system-wide announcements and incentives for members
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Megaphone className="size-12 mx-auto mb-4 opacity-50" />
              <p>No announcements yet. Create your first announcement!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => {
            const TypeIcon = typeIcons[announcement.type]
            return (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${typeColors[announcement.type]}`}>
                        <TypeIcon className="size-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle>{announcement.title}</CardTitle>
                          <Badge
                            variant="secondary"
                            className={`${priorityColors[announcement.priority]} text-white`}
                          >
                            {announcement.priority}
                          </Badge>
                          {!announcement.is_active && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                        <CardDescription className="whitespace-pre-wrap">
                          {announcement.content}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Type: {announcement.type}</span>
                          <span>
                            Created: {format(new Date(announcement.created_at), "PPp")}
                          </span>
                          {announcement.expires_at && (
                            <span>
                              Expires: {format(new Date(announcement.expires_at), "PPp")}
                            </span>
                          )}
                          {announcement.created_by_user && (
                            <span>By: {announcement.created_by_user.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(announcement.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingAnnouncement}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setEditingAnnouncement(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? "Update the announcement details"
                : "Create a new announcement for all members"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Top Performer Incentive"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Announcement details..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: string) => setFormData({ ...formData, type: value as CreateAnnouncementDto['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="incentive">Incentive</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: string) => setFormData({ ...formData, priority: value as CreateAnnouncementDto['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingAnnouncement(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.title ||
                !formData.content ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingAnnouncement ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

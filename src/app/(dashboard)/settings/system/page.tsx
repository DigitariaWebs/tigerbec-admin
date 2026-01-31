"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Percent, Save, Info, Plus, Pencil, Trash2, Megaphone, AlertCircle, Trophy, Bell } from "lucide-react"
import { toast } from "sonner"
import { settingsApi } from "@/lib/api/settings"
import { announcementsApi, Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from "@/lib/api/announcements"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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

export default function SystemSettingsPage() {
  const queryClient = useQueryClient()
  const [franchiseFee, setFranchiseFee] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state for announcements
  const [formData, setFormData] = useState<CreateAnnouncementDto>({
    title: "",
    content: "",
    type: "general",
    priority: "normal",
    is_active: true,
    expires_at: "",
    image_url: "",
  })

  // Fetch franchise fee setting
  const { data: franchiseFeeData, isLoading } = useQuery({
    queryKey: ["settings", "tctpro_franchise_fee"],
    queryFn: () => settingsApi.getByKey("tctpro_franchise_fee"),
  })

  // Fetch announcements
  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementsApi.list(),
  })

  // Set initial value when data is loaded
  React.useEffect(() => {
    if (franchiseFeeData?.setting_value) {
      setFranchiseFee(franchiseFeeData.setting_value)
    }
  }, [franchiseFeeData])

  // Update franchise fee mutation
  const updateMutation = useMutation({
    mutationFn: (value: number) => settingsApi.updateFranchiseFee(value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      toast.success("Franchise fee updated successfully")
      setFranchiseFee(data.setting_value)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update franchise fee")
    },
  })

  // Create announcement mutation
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

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
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

  // Delete announcement mutation
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
      image_url: "",
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
      image_url: announcement.image_url || "",
    })
  }

  const handleSubmitAnnouncement = () => {
    const submitData = {
      ...formData,
      expires_at: formData.expires_at || undefined,
      image_url: formData.image_url || undefined,
    }

    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncement.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const value = parseFloat(franchiseFee)
    
    if (isNaN(value)) {
      toast.error("Please enter a valid number")
      return
    }
    
    if (value < 0 || value > 100) {
      toast.error("Franchise fee must be between 0 and 100")
      return
    }
    
    updateMutation.mutate(value)
  }

  const handleReset = () => {
    if (franchiseFeeData) {
      setFranchiseFee(franchiseFeeData.setting_value)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage system-wide configuration and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="size-5" />
            Franchise Fee
          </CardTitle>
          <CardDescription>
            Set the franchise fee percentage applied to car sales profit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              The franchise fee is deducted from the gross profit of each car sale. 
              The net profit (after franchise fee) is what members see in their reports.
              This fee is recorded with each sale for historical accuracy.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="franchiseFee">Franchise Fee Percentage</Label>
              <div className="flex gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Input
                    id="franchiseFee"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={franchiseFee}
                    onChange={(e) => setFranchiseFee(e.target.value)}
                    className="pr-8"
                    placeholder="5.00"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a value between 0 and 100. Example: 5 means 5% franchise fee.
              </p>
            </div>

            {franchiseFeeData && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Value:</span>
                  <span className="font-medium">{franchiseFeeData.setting_value}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(franchiseFeeData.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending || franchiseFee === franchiseFeeData?.setting_value}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={franchiseFee === franchiseFeeData?.setting_value}
              >
                Reset
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">How it works:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Gross Profit = Sale Price - (Purchase Price + Additional Expenses)</li>
              <li>Franchise Fee = Gross Profit × (Franchise Fee % ÷ 100)</li>
              <li>Net Profit = Gross Profit - Franchise Fee</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Example:</p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                If a car sale has $10,000 gross profit and the franchise fee is 22%:
                <br />
                Franchise Fee = $2,200, Net Profit = $7,800
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="size-5" />
                Announcements
              </CardTitle>
              <CardDescription>
                Manage system-wide announcements and incentives for members
              </CardDescription>
            </div>
             
          </div>
        </CardHeader>
        <CardContent>
          {announcementsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="size-6 animate-spin mx-auto mb-2" />
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="size-12 mx-auto mb-4 opacity-50" />
              <p>No announcements yet. Create your first announcement!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const TypeIcon = typeIcons[announcement.type]
                return (
                  <div key={announcement.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      {announcement.image_url && (
                        <img
                          src={announcement.image_url}
                          alt={announcement.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${typeColors[announcement.type]}`}>
                          <TypeIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold">{announcement.title}</h4>
                            <Badge
                              variant="secondary"
                              className={`${priorityColors[announcement.priority]} text-white text-xs`}
                            >
                              {announcement.priority}
                            </Badge>
                            {!announcement.is_active && (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Type: {announcement.type}</span>
                            <span>Created: {format(new Date(announcement.created_at), "PP")}</span>
                            {announcement.expires_at && (
                              <span>Expires: {format(new Date(announcement.expires_at), "PP")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Announcement Dialog */}
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
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Provide a URL to an image that represents this announcement
              </p>
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
              onClick={handleSubmitAnnouncement}
              disabled={
                !formData.title ||
                !formData.content ||
                createMutation.isPending ||
                updateAnnouncementMutation.isPending
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

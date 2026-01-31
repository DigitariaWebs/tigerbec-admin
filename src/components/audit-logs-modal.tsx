"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admins"
import { AuditLog } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Clock, User, Database, Search } from "lucide-react"

interface AuditLogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actorId?: string
}

export function AuditLogsModal({ open, onOpenChange, actorId }: AuditLogsModalProps) {
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    start_date: '',
  })

  const queryParams = {
    ...(filters.action && { action: filters.action }),
    ...(filters.entity_type && { entity_type: filters.entity_type }),
    ...(filters.start_date && { start_date: filters.start_date }),
    ...(actorId && { actor_id: actorId }),
  }

  const { data: logs = [], isLoading, error } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs', queryParams],
    queryFn: () => adminApi.getAuditLogs(queryParams),
    enabled: open,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    if (action.includes('create')) return 'default'
    if (action.includes('update') || action.includes('edit')) return 'secondary'
    if (action.includes('delete')) return 'destructive'
    return 'outline'
  }

  const handleReset = () => {
    setFilters({
      action: '',
      entity_type: '',
      start_date: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </DialogTitle>
          <DialogDescription>
            View system activity and changes made by administrators
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y">
          <div className="space-y-2">
            <Label htmlFor="action-filter">Action</Label>
            <Select
              value={filters.action}
              onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
            >
              <SelectTrigger id="action-filter">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All actions</SelectItem>
                <SelectItem value="member_created">Member Created</SelectItem>
                <SelectItem value="member_updated">Member Updated</SelectItem>
                <SelectItem value="member_deleted">Member Deleted</SelectItem>
                <SelectItem value="admin_created">Admin Created</SelectItem>
                <SelectItem value="admin_updated">Admin Updated</SelectItem>
                <SelectItem value="admin_deleted">Admin Deleted</SelectItem>
                <SelectItem value="car_created">Car Created</SelectItem>
                <SelectItem value="car_updated">Car Updated</SelectItem>
                <SelectItem value="car_sold">Car Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity-filter">Entity Type</Label>
            <Select
              value={filters.entity_type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, entity_type: value }))}
            >
              <SelectTrigger id="entity-filter">
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All entities</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="car">Car</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-filter">Start Date</Label>
            <Input
              id="date-filter"
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
        </div>

        {/* Logs List */}
        <ScrollArea className="flex-1 pr-4 min-h-100">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <p className="font-semibold">Error loading audit logs</p>
              <p className="text-sm">{error instanceof Error ? error.message : 'An error occurred'}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No audit logs found</p>
              <p className="text-sm">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {log.entity_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.created_at)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Actor:</span>
                        <span className="font-mono text-xs">{log.actor_id.substring(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Entity:</span>
                        <span className="font-mono text-xs">{log.entity_id.substring(0, 8)}...</span>
                      </div>
                    </div>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View metadata
                        </summary>
                        <pre className="mt-2 rounded bg-muted p-2 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <div>
            Showing {logs.length} {logs.length === 1 ? 'log' : 'logs'}
          </div>
          {(filters.action || filters.entity_type || filters.start_date) && (
            <button
              onClick={handleReset}
              className="text-primary hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

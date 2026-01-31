"use client"

import { ActivityLog } from "@/lib/api/logs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LogsTableProps {
  logs: ActivityLog[]
  total: number
  limit: number
  offset: number
  isLoading: boolean
  onPageChange: (offset: number) => void
}

export function LogsTable({
  logs,
  total,
  limit,
  offset,
  isLoading,
  onPageChange,
}: LogsTableProps) {
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  const getActivityTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      signup: "default",
      signin: "secondary",
      password_reset: "outline",
      profile_update: "default",
      delete: "destructive",
      car_added: "default",
      car_updated: "secondary",
      car_sold: "default",
      oauth_signin: "secondary",
    }
    return colorMap[type] || "default"
  }

  const getResourceTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      admin: "default",
      member: "secondary",
      car: "outline",
    }
    return colorMap[type] || "default"
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No logs found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {log.status === "success" ? (
                    <Badge variant="outline" className="gap-1 border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400">
                      <XCircle className="h-3 w-3" />
                      Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getActivityTypeColor(log.activity_type) as "default" | "secondary" | "destructive" | "outline" | null | undefined}>
                    {log.activity_type.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getResourceTypeColor(log.resource_type) as "default" | "secondary" | "destructive" | "outline" | null | undefined}>
                    {log.resource_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{log.user_email || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {log.user_id ? `${log.user_id.substring(0, 8)}...` : 'N/A'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={log.user_role === "admin" ? "default" : "secondary"}>
                    {log.user_role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">
                      {format(new Date(log.created_at), "MMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "HH:mm:ss")}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Activity Log Details</DialogTitle>
                        <DialogDescription>
                          Full details for this activity log entry
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Log ID</p>
                            <p className="font-mono text-sm">{log.id}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge variant={log.status === "success" ? "outline" : "destructive"}>
                              {log.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">User ID</p>
                            <p className="font-mono text-sm">{log.user_id}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">User Email</p>
                            <p className="text-sm">{log.user_email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">User Role</p>
                            <Badge>{log.user_role}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Activity Type</p>
                            <Badge>{log.activity_type}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Resource Type</p>
                            <Badge>{log.resource_type}</Badge>
                          </div>
                          {log.resource_id && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Resource ID
                              </p>
                              <p className="font-mono text-sm">{log.resource_id}</p>
                            </div>
                          )}
                          {log.ip_address && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                              <p className="font-mono text-sm">{log.ip_address}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                            <p className="text-sm">
                              {format(new Date(log.created_at), "PPpp")}
                            </p>
                          </div>
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div>
                            <p className="mb-2 text-sm font-medium text-muted-foreground">
                              Additional Details
                            </p>
                            <ScrollArea className="h-[200px] rounded-md border p-4">
                              <pre className="text-xs">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(offset - limit)}
            disabled={offset === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(offset + limit)}
            disabled={offset + limit >= total}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

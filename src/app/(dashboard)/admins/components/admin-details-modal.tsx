"use client"


import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admins"
import { Admin } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Shield, Mail, Calendar, Clock, User, RefreshCw, Phone, CheckCircle, XCircle, Image } from "lucide-react"

interface AdminDetailsModalProps {
  adminId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminDetailsModal({ adminId, open, onOpenChange }: AdminDetailsModalProps) {
  const shouldFetch = Boolean(adminId) && open;
  
  const { data: admin, isLoading, error, refetch } = useQuery<Admin>({
    queryKey: ['admin-details', adminId],
    queryFn: async () => {
      if (!adminId) {
        throw new Error('Admin ID is required');
      }
      console.log('[AdminDetailsModal] Fetching admin with ID:', adminId);
      const result = await adminApi.getProfile(adminId);
      console.log('[AdminDetailsModal] Received admin data:', result);
      return result;
    },
    enabled: shouldFetch,
    retry: 1,
  })

  console.log('[AdminDetailsModal] Modal state:', { 
    adminId, 
    open, 
    shouldFetch,
    isLoading, 
    error: error?.message, 
    hasAdminData: !!admin,
    adminData: admin 
  });

  const generateAvatar = (name: string) => {
    if (!name || typeof name !== 'string') return '??'
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Admin Details</DialogTitle>
          <DialogDescription>
            View detailed information about this administrator
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2">
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <p className="font-semibold">Error loading admin details</p>
              <p className="text-sm">{error instanceof Error ? error.message : 'An error occurred'}</p>
              <p className="text-xs mt-2 font-mono">Admin ID: {adminId}</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : admin ? (
          <div className="space-y-6">
            {/* Admin Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {generateAvatar(admin.full_name || admin.name || 'Unknown')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-semibold">{admin.full_name || admin.name || 'Unknown Admin'}</h3>
                  <Badge variant="secondary" className="text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                </div>
                <p className="text-muted-foreground">{admin.email}</p>
              </div>
            </div>

            {/* Admin Details Grid */}
            <div className="grid gap-4">
              <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="rounded-full p-2 bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Admin ID</p>
                  <p className="text-sm font-mono">{admin.id || admin.user_id || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="rounded-full p-2 bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-sm">{admin.email}</p>
                </div>
              </div>

              {admin.phone && (
                <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="rounded-full p-2 bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-sm">{admin.phone}</p>
                  </div>
                </div>
              )}

              {admin.role && (
                <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="rounded-full p-2 bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <Badge variant="secondary" className="text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20">
                      {admin.role}
                    </Badge>
                  </div>
                </div>
              )}

              {typeof admin.is_active !== 'undefined' && (
                <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="rounded-full p-2 bg-primary/10">
                    {admin.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                    <Badge variant={admin.is_active ? "default" : "destructive"}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              )}

              {admin.avatar_url && (
                <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="rounded-full p-2 bg-primary/10">
                    <Image className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Avatar URL</p>
                    <p className="text-sm break-all">{admin.avatar_url}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="rounded-full p-2 bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Joined Date</p>
                  <p className="text-sm">{formatDate(admin.created_at)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="rounded-full p-2 bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDate(admin.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-muted p-4 text-muted-foreground">
            <p>No admin data available</p>
            <p className="text-xs mt-2 font-mono">Admin ID: {adminId}</p>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

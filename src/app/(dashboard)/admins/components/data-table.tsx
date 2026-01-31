"use client"

import { useState, useEffect, useMemo } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  Search,
  Shield,
} from "lucide-react"

import { Admin, AdminRole } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminDetailsModal } from "./admin-details-modal"
import { AdminFormDialog, type AdminFormValues } from "./admin-form-dialog"
import { AdminEditModal, type AdminEditFormValues } from "./admin-edit-modal"
import { ResetPasswordModal } from "@/components/reset-password-modal"
import { AuditLogsModal } from "@/components/audit-logs-modal"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps {
  admins: Admin[]
  isLoading: boolean
  onAddAdmin: (data: AdminFormValues) => Promise<void>
  onDeleteAdmin: (id: string) => void
  onEditAdmin: (admin: Admin) => void
  onUpdateAdmin: (id: string, data: Partial<Pick<Admin, 'full_name' | 'email'>>) => void
  onModifyAdmin: (id: string, data: AdminEditFormValues) => Promise<void>
}

export function DataTable({ 
  admins, 
  isLoading,
  onAddAdmin,
  onDeleteAdmin,  
  onModifyAdmin
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  
  // Modal states
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false)
  const [auditLogsModalOpen, setAuditLogsModalOpen] = useState(false)
  const [selectedAdminName, setSelectedAdminName] = useState<string | undefined>()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  
  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState<Admin | null>(null)
  
  useEffect(() => {
    const adminData = localStorage.getItem('admin_user')
    console.log('[DataTable] Admin data from localStorage:', adminData)
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData)
        console.log('[DataTable] Parsed admin user:', parsed)
        setCurrentUser(parsed)
      } catch (e) {
        console.error('Failed to parse admin user data:', e)
      }
    }
  }, [])
  
  const isSuperAdmin = currentUser?.role === AdminRole.SUPER_ADMIN
  
  console.log('[DataTable] Current user:', currentUser)
  console.log('[DataTable] Is super admin:', isSuperAdmin)

  const generateAvatar = (name: string) => {
    if (!name || typeof name !== 'string') return '??';
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns: ColumnDef<Admin>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "full_name",
      header: "Admin",
      cell: ({ row }) => {
        const admin = row.original
        const displayName = admin.full_name || admin.name || 'Unknown'
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {generateAvatar(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{displayName}</span>
                <Shield className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-sm text-muted-foreground">{admin.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const admin = row.original
        const isSuperAdmin = admin.role === AdminRole.SUPER_ADMIN
        return (
          <Badge 
            variant="secondary" 
            className={isSuperAdmin 
              ? "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
              : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
            }
          >
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined Date",
      cell: ({ row }) => {
        return <span className="text-sm">{formatDate(row.original.created_at)}</span>
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => {
        return <span className="text-sm">{formatDate(row.original.updated_at)}</span>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const admin = row.original
        const isOwnProfile = (currentUser?.user_id || currentUser?.id) === (admin.user_id || admin.id)
        const canEdit = isSuperAdmin || isOwnProfile
        const canDelete = isSuperAdmin && !isOwnProfile
        
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                console.log('[DataTable] View Details clicked, admin:', admin);
                setSelectedAdminId(admin.user_id || admin.id || '')
                setSelectedAdminName(admin.full_name || admin.name)
                setDetailsModalOpen(true)
              }}
            >
              <Eye className="size-4" />
              <span className="sr-only">View admin</span>
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => {
                  setSelectedAdmin(admin)
                  setEditModalOpen(true)
                }}
              >
                <Pencil className="size-4" />
                <span className="sr-only">Edit admin</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => {
                    console.log('[DataTable] Dropdown View Details clicked, admin:', admin);
                    setSelectedAdminId(admin.user_id || admin.id || '')
                    setSelectedAdminName(admin.full_name || admin.name)
                    setDetailsModalOpen(true)
                  }}
                >
                  View Details
                </DropdownMenuItem>
                 
                {(isSuperAdmin || isOwnProfile) && (
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedAdminId(admin.user_id || admin.id || '')
                      setSelectedAdminName(admin.full_name || admin.name)
                      setResetPasswordModalOpen(true)
                    }}
                  >
                    Reset Password
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => onDeleteAdmin(admin.user_id || admin.id || '')}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete Admin
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ], [currentUser, isSuperAdmin, onDeleteAdmin])

  const table = useReactTable({
    data: admins,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search admins..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isSuperAdmin && <AdminFormDialog onAddAdmin={onAddAdmin} />}
          <Button variant="outline" className="cursor-pointer">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                Columns <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No admins found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size" className="text-sm font-medium">
            Show
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="page-size">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Page</p>
              <strong className="text-sm">
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdminDetailsModal
        adminId={selectedAdminId}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
      
      <AdminEditModal
        admin={selectedAdmin}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={onModifyAdmin}
      />
      
      <ResetPasswordModal
        userId={selectedAdminId}
        userName={selectedAdminName}
        userType="admin"
        open={resetPasswordModalOpen}
        onOpenChange={setResetPasswordModalOpen}
      />
      
      <AuditLogsModal
        open={auditLogsModalOpen}
        onOpenChange={setAuditLogsModalOpen}
        actorId={selectedAdminId || undefined}
      />
    </div>
  )
}

"use client"

import { format } from "date-fns"
import { Eye, Car } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { InventoryRequest } from "@/lib/api/inventory-requests"
import type { RequestStatus } from "../page"

interface DataTableProps {
  requests: InventoryRequest[]
  isLoading: boolean
  statusFilter: RequestStatus
  onViewDetails: (request: InventoryRequest) => void
}

const statusConfig = {
  pending: { label: "Pending", variant: "outline" as const, className: "border-yellow-500 text-yellow-700" },
  approved: { label: "Approved", variant: "outline" as const, className: "border-green-500 text-green-700" },
  rejected: { label: "Rejected", variant: "outline" as const, className: "border-red-500 text-red-700" },
}

export function DataTable({ requests, isLoading, statusFilter, onViewDetails }: DataTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === 'all' ? 'All Requests' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Requests`}
          </CardTitle>
          <CardDescription>
            {statusFilter === 'all' 
              ? 'No inventory requests found' 
              : `No ${statusFilter} requests at this time`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No requests to display</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {statusFilter === 'all' ? 'All Requests' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Requests`}
        </CardTitle>
        <CardDescription>
          {requests.length} {requests.length === 1 ? 'request' : 'requests'} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const statusInfo = statusConfig[request.status]
                
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {request.year} {request.make || ""} {request.model}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {request.vin}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.member_name}</div>
                        <div className="text-xs text-muted-foreground">{request.member_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      ${request.purchase_price.toLocaleString('en-US', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), "h:mm a")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(request)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

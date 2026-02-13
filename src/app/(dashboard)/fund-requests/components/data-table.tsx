"use client"

import { format } from "date-fns"
import { Clock, CheckCircle, XCircle, Wallet } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type FundRequest } from "@/lib/api/fund-requests"
import { type RequestStatus } from "../page"

interface DataTableProps {
  requests: FundRequest[]
  isLoading: boolean
  statusFilter: RequestStatus
  onViewDetails: (request: FundRequest) => void
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "outline" as const,
    className: "border-yellow-500 text-yellow-700",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    variant: "outline" as const,
    className: "border-green-500 text-green-700",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    variant: "outline" as const,
    className: "border-red-500 text-red-700",
    icon: XCircle,
  },
}

export function DataTable({ requests, isLoading, statusFilter, onViewDetails }: DataTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fund Requests</CardTitle>
          <CardDescription>Loading fund requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fund Requests</CardTitle>
          <CardDescription>
            {statusFilter === "all"
              ? "No fund requests found"
              : `No ${statusFilter} fund requests`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No requests found</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter === "pending"
                ? "There are no pending fund requests at the moment"
                : `No ${statusFilter === "all" ? "" : statusFilter} fund requests found`}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund Requests</CardTitle>
        <CardDescription>
          {statusFilter === "all"
            ? "All fund requests"
            : `${statusConfig[statusFilter as keyof typeof statusConfig]?.label || statusFilter} fund requests`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const config = statusConfig[request.status]
                const StatusIcon = config.icon
                const isWithdrawal =
                  request.amount < 0 ||
                  (typeof request.notes === 'string' &&
                    request.notes.trim().toUpperCase().startsWith('[WITHDRAWAL]'))
                const displayAmount = isWithdrawal ? -Math.abs(request.amount) : request.amount

                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.member_name}</p>
                        <p className="text-sm text-muted-foreground">{request.member_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      <span className={isWithdrawal ? "text-red-600" : undefined}>
                        ${displayAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className={config.className}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), "h:mm a")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.reviewer_name ? (
                        <div>
                          <p className="font-medium">{request.reviewer_name}</p>
                          {request.reviewed_at && (
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(request.reviewed_at), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(request)}
                      >
                        {request.status === "pending" ? "Review" : "View Details"}
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

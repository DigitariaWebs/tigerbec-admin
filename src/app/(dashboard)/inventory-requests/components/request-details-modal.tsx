"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CheckCircle, XCircle, Car, Calendar, DollarSign, Hash, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { inventoryRequestsApi, type InventoryRequest } from "@/lib/api/inventory-requests"

interface RequestDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  request: InventoryRequest
}

const statusConfig = {
  pending: { label: "Pending Review", variant: "outline" as const, className: "border-yellow-500 text-yellow-700" },
  approved: { label: "Approved", variant: "outline" as const, className: "border-green-500 text-green-700" },
  rejected: { label: "Rejected", variant: "outline" as const, className: "border-red-500 text-red-700" },
}

export function RequestDetailsModal({ isOpen, onClose, request }: RequestDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const statusInfo = statusConfig[request.status]
  const isPending = request.status === 'pending'

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this inventory request? This will add the car to the member's inventory.")) {
      return
    }

    setIsProcessing(true)
    try {
      await inventoryRequestsApi.review(request.id, { status: 'approved' })
      toast.success("Request approved successfully! Car has been added to member's inventory.")
      onClose()
    } catch (error) {
      console.error('Failed to approve request:', error)
      const message = error instanceof Error ? error.message : "Failed to approve request"
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    if (!confirm("Are you sure you want to reject this inventory request?")) {
      return
    }

    setIsProcessing(true)
    try {
      await inventoryRequestsApi.review(request.id, { 
        status: 'rejected',
        rejection_reason: rejectionReason 
      })
      toast.success("Request rejected successfully")
      onClose()
    } catch (error) {
      console.error('Failed to reject request:', error)
      const message = error instanceof Error ? error.message : "Failed to reject request"
      toast.error(message)
    } finally {
      setIsProcessing(false)
      setShowRejectForm(false)
      setRejectionReason("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Inventory Request Details
          </DialogTitle>
          <DialogDescription>
            Review the details of this car inventory request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge variant={statusInfo.variant} className={statusInfo.className}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Vehicle Information */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <h3 className="font-semibold text-lg">Vehicle Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Make</p>
                <p className="font-medium">{request.make || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-medium">{request.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{request.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-mono text-sm">{request.vin}</p>
              </div>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <h3 className="font-semibold">Purchase Details</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Purchase Price
                </div>
                <span className="font-semibold text-lg">
                  ${request.purchase_price.toLocaleString('en-US', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>

              {request.purchase_date && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Purchase Date
                  </div>
                  <span className="font-medium">
                    {format(new Date(request.purchase_date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Member Information */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h3 className="font-semibold">Requested By</h3>
            <div>
              <p className="font-medium">{request.member_name}</p>
              <p className="text-sm text-muted-foreground">{request.member_email}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Requested on {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" />
                Notes
              </div>
              <p className="text-sm">{request.notes}</p>
            </div>
          )}

          {/* Review Information (if reviewed) */}
          {!isPending && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h3 className="font-semibold">Review Information</h3>
              <div>
                <p className="text-sm text-muted-foreground">Reviewed by</p>
                <p className="font-medium">{request.reviewer_name || 'Unknown'}</p>
              </div>
              {request.reviewed_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Reviewed on</p>
                  <p className="text-sm">
                    {format(new Date(request.reviewed_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
              {request.rejection_reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Rejection Reason</p>
                  <p className="text-sm">{request.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
              <Label htmlFor="rejection_reason">Rejection Reason *</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this request..."
                rows={4}
                className="bg-white"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isPending ? (
            <>
              {!showRejectForm ? (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectionReason("")
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                  >
                    {isProcessing ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

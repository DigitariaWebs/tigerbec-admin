"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { inventoryRequestsApi, type InventoryRequest } from "@/lib/api/inventory-requests"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { RequestDetailsModal } from "./components/request-details-modal"

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'all'

export default function InventoryRequestsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<RequestStatus>('pending')
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Fetch all requests
  const { 
    data: requests = [], 
    isLoading,
    refetch,
  } = useQuery<InventoryRequest[]>({
    queryKey: ['inventory-requests', statusFilter],
    queryFn: () => {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined
      return inventoryRequestsApi.getAll(filters)
    },
    staleTime: 10000, // 10 seconds
  })

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['inventory-requests-stats'],
    queryFn: () => inventoryRequestsApi.getStats(),
    staleTime: 30000, // 30 seconds
  })

  const handleViewDetails = (request: InventoryRequest) => {
    setSelectedRequest(request)
    setIsDetailsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedRequest(null)
    // Invalidate all related queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['inventory-requests'] })
    queryClient.invalidateQueries({ queryKey: ['inventory-requests-stats'] })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve member car inventory requests
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <StatCards 
          stats={stats}
          currentFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
      )}

      {/* Data Table */}
      <DataTable 
        requests={requests}
        isLoading={isLoading}
        statusFilter={statusFilter}
        onViewDetails={handleViewDetails}
      />

      {/* Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModal}
          request={selectedRequest}
        />
      )}
    </div>
  )
}

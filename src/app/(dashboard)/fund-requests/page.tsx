"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fundRequestsApi, type FundRequest } from "@/lib/api/fund-requests"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { FundRequestDetailsModal } from "./components/fund-request-details-modal"

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'all'

export default function FundRequestsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<RequestStatus>('pending')
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Fetch all requests
  const { 
    data: allRequests = [], 
    isLoading,
  } = useQuery<FundRequest[]>({
    queryKey: ['admin-fund-requests'],
    queryFn: () => fundRequestsApi.getAll(),
    staleTime: 10000, // 10 seconds
  })

  // Filter requests based on status
  const requests = statusFilter === 'all' 
    ? allRequests 
    : allRequests.filter(req => req.status === statusFilter)

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-fund-requests-stats'],
    queryFn: () => fundRequestsApi.getStats(),
    staleTime: 30000, // 30 seconds
  })

  const handleViewDetails = (request: FundRequest) => {
    setSelectedRequest(request)
    setIsDetailsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedRequest(null)
    // Invalidate all related queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['admin-fund-requests'] })
    queryClient.invalidateQueries({ queryKey: ['admin-fund-requests-stats'] })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fund Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage member fund requests
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
        <FundRequestDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModal}
          request={selectedRequest}
        />
      )}
    </div>
  )
}

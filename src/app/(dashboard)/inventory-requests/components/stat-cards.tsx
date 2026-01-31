"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RequestStatus } from "../page"

interface StatCardsProps {
  stats: {
    total_requests: number
    pending_requests: number
    approved_requests: number
    rejected_requests: number
  }
  currentFilter: RequestStatus
  onFilterChange: (filter: RequestStatus) => void
}

export function StatCards({ stats, currentFilter, onFilterChange }: StatCardsProps) {
  const cards = [
    {
      title: "Total Requests",
      value: stats.total_requests,
      icon: ClipboardList,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      filter: 'all' as RequestStatus,
    },
    {
      title: "Pending",
      value: stats.pending_requests,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
      filter: 'pending' as RequestStatus,
    },
    {
      title: "Approved",
      value: stats.approved_requests,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      filter: 'approved' as RequestStatus,
    },
    {
      title: "Rejected",
      value: stats.rejected_requests,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      filter: 'rejected' as RequestStatus,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = currentFilter === card.filter
        
        return (
          <Card
            key={card.title}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isActive && "ring-2 ring-primary"
            )}
            onClick={() => onFilterChange(card.filter)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <Icon className={cn("h-4 w-4", card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

"use client"

import { Wallet, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type FundRequestStats } from "@/lib/api/fund-requests"
import { type RequestStatus } from "../page"

interface StatCardsProps {
  stats: FundRequestStats
  currentFilter: RequestStatus
  onFilterChange: (status: RequestStatus) => void
}

export function StatCards({ stats, currentFilter, onFilterChange }: StatCardsProps) {
  const cards = [
    {
      title: "Total Requests",
      value: stats.total,
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      filter: "all" as RequestStatus,
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      filter: "pending" as RequestStatus,
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      filter: "approved" as RequestStatus,
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      filter: "rejected" as RequestStatus,
    },
    {
      title: "Total Approved Amount",
      value: `$${stats.total_amount_approved.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      filter: null,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = currentFilter === card.filter
        const canClick = card.filter !== null

        return (
          <Card
            key={card.title}
            className={`${
              canClick ? "cursor-pointer transition-all hover:shadow-md" : ""
            } ${isActive ? "ring-2 ring-primary" : ""}`}
            onClick={() => canClick && card.filter && onFilterChange(card.filter)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`rounded-full p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
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

"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api/analytics"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Activity } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function KPIMetrics() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['global-kpis'],
    queryFn: () => analyticsApi.getGlobalKPIs(),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-16">
                <LoadingSpinner />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!kpis) return null

  const totalInvested = parseFloat(kpis.total_invested || '0')
  const totalProfit = parseFloat(kpis.total_profit || '0')
  const totalFranchiseFees = parseFloat(kpis.total_franchise_fees || '0')
  const profitRatio = kpis.average_profit_ratio || 0

  const metrics = [
    {
      title: "Total Franchise Fees",
      value: `$${totalFranchiseFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Collected from all sales",
      icon: DollarSign,
      trend: totalFranchiseFees > 0 ? "up" : "neutral",
      trendValue: "22% of gross profit",
      color: "text-orange-500",
    },
    {
      title: "Total Net Profit",
      value: `$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: `${profitRatio.toFixed(1)}% profit margin`,
      icon: Activity,
      trend: totalProfit > 0 ? "up" : totalProfit < 0 ? "down" : "neutral",
      trendValue: `After franchise fees`,
      color: totalProfit > 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Cars Sold",
      value: kpis.total_cars_sold.toString(),
      description: `${kpis.total_cars_bought} purchased`,
      icon: ShoppingCart,
      trend: kpis.total_cars_sold > 0 ? "up" : "neutral",
      trendValue: `${kpis.total_cars_bought - kpis.total_cars_sold} in inventory`,
      color: "text-blue-500",
    },
    {
      title: "Active Members",
      value: kpis.total_members.toString(),
      description: "Total registered members",
      icon: Users,
      trend: "up",
      trendValue: "+4 this month",
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Activity

        return (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
              <div className="flex items-center mt-2 text-xs">
                <TrendIcon className={`h-3 w-3 mr-1 ${metric.color}`} />
                <span className="text-muted-foreground">{metric.trendValue}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

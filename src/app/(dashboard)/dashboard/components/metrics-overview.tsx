"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Car,
  Percent 
} from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GlobalKPIs } from "@/types"

interface MetricsOverviewProps {
  data: GlobalKPIs | null
  isLoading?: boolean
}

export function MetricsOverview({ data, isLoading }: MetricsOverviewProps) {
  if (isLoading || !data) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 lg:grid-cols-3 @5xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="cursor-pointer animate-pulse">
            <CardHeader>
              <CardDescription className="h-4 bg-muted rounded w-24" />
              <CardTitle className="h-8 bg-muted rounded w-32 mt-2" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const totalInvested = parseFloat(data.total_invested)
  const totalNetProfit = parseFloat(data.total_profit)
  const totalFranchiseFees = parseFloat(data.total_franchise_fees || '0')
  const totalGrossProfit = totalNetProfit + totalFranchiseFees
  const profitRatio = data.average_profit_ratio

  const metrics = [
    {
      title: "Total Invested",
      value: `$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Total capital invested",
      change: totalInvested > 0 ? "+100%" : "0%",
      trend: "up" as const,
      icon: DollarSign,
      footer: "Capital invested in inventory",
      subfooter: `${data.total_cars_bought} cars purchased`
    },
    {
      title: "Gross Profit",
      value: `$${totalGrossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Before franchise fees",
      change: totalGrossProfit > 0 ? `+${((totalGrossProfit / totalInvested) * 100).toFixed(1)}%` : "0%", 
      trend: totalGrossProfit >= 0 ? "up" as const : "down" as const,
      icon: TrendingUp,
      footer: "Total profit before fees",
      subfooter: `From ${data.total_cars_sold} sold cars`
    },
    {
      title: "Net Profit",
      value: `$${totalNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "After franchise fees",
      change: totalNetProfit > 0 ? `+${profitRatio.toFixed(1)}%` : "0%", 
      trend: totalNetProfit >= 0 ? "up" as const : "down" as const,
      icon: TrendingUp,
      footer: "Net profit after fees",
      subfooter: `${((totalNetProfit / totalGrossProfit) * 100).toFixed(1)}% of gross`
    },
    {
      title: "Franchise Fees",
      value: `$${totalFranchiseFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Total fees collected",
      change: totalFranchiseFees > 0 ? "22%" : "0%", 
      trend: "up" as const,
      icon: DollarSign,
      footer: "Franchise fee revenue",
      subfooter: `${((totalFranchiseFees / totalGrossProfit) * 100).toFixed(1)}% of gross profit`
    }, 
    {
      title: "Avg Profit Ratio",
      value: `${profitRatio.toFixed(2)}%`,
      description: "Average return on investment",
      change: profitRatio > 0 ? `+${profitRatio.toFixed(1)}%` : "0%",
      trend: profitRatio >= 0 ? "up" as const : "down" as const,
      icon: Percent,
      footer: "Average ROI per sale",
      subfooter: `Across ${data.total_members} members`
    },
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 lg:grid-cols-3 @5xl:grid-cols-5">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        
        return (
          <Card key={metric.title} className="cursor-pointer">
            <CardHeader>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon className="h-4 w-4" />
                  {metric.change}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.footer} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {metric.subfooter}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

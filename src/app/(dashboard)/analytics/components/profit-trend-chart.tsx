"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { carSalesApi } from "@/lib/api/car-sales"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp } from "lucide-react"

const chartConfig = {
  net_profit: {
    label: "Net Profit",
    color: "hsl(var(--chart-1))",
  },
  gross_profit: {
    label: "Gross Profit",
    color: "hsl(var(--chart-3))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
}

export function ProfitTrendChart() {
  const [timeRange, setTimeRange] = useState("6m")

  const { data: sales, isLoading } = useQuery({
    queryKey: ['car-sales'],
    queryFn: () => carSalesApi.list(),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Profit & Revenue Trend</CardTitle>
          <CardDescription>Gross profit, net profit and revenue over time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!sales || sales.length === 0) {
    return (
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Profit & Revenue Trend</CardTitle>
          <CardDescription>Gross profit, net profit and revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No sales data available</p>
        </CardContent>
      </Card>
    )
  }

  // Group sales by month for trend
  const monthlyData = sales.reduce((acc, sale) => {
    const date = new Date(sale.sold_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        net_profit: 0,
        gross_profit: 0,
        revenue: 0,
      }
    }

    acc[monthKey].net_profit += sale.net_profit || 0
    acc[monthKey].gross_profit += sale.profit || 0
    acc[monthKey].revenue += sale.sold_price

    return acc
  }, {} as Record<string, { month: string; net_profit: number; gross_profit: number; revenue: number }>)

  // Convert to array and sort
  const monthsToShow = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : timeRange === "1y" ? 12 : timeRange === "2y" ? 24 : timeRange === "5y" ? 60 : 9999
  const chartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(timeRange === "lifetime" ? 0 : -monthsToShow)
    .map(([, data]) => data)

  // Calculate growth
  const totalNetProfit = sales.reduce((sum, sale) => sum + (sale.net_profit || 0), 0)
  const totalGrossProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)
  const avgNetProfit = totalNetProfit / chartData.length
  const avgGrossProfit = totalGrossProfit / chartData.length
  const profitMargin = (totalNetProfit / sales.reduce((sum, sale) => sum + sale.sold_price, 0)) * 100

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profit & Revenue Trend</CardTitle>
            <CardDescription>
              {timeRange === "3m" ? "Last 3 months" : timeRange === "6m" ? "Last 6 months" : timeRange === "1y" ? "Last 12 months" : timeRange === "2y" ? "Last 2 years" : timeRange === "5y" ? "Last 5 years" : "All-time"} performance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m" className="cursor-pointer">Last 3 months</SelectItem>
                <SelectItem value="6m" className="cursor-pointer">Last 6 months</SelectItem>
                <SelectItem value="1y" className="cursor-pointer">Last 1 year</SelectItem>
                <SelectItem value="2y" className="cursor-pointer">Last 2 years</SelectItem>
                <SelectItem value="5y" className="cursor-pointer">Last 5 years</SelectItem>
                <SelectItem value="lifetime" className="cursor-pointer">Lifetime</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-blue-600">
              ${(avgGrossProfit / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg. Gross Profit</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-green-600">
              ${(avgNetProfit / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg. Net Profit</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold">{profitMargin.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Net Margin</p>
          </div>
        </div>

        {/* Area Chart */}
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNetProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-net_profit)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-net_profit)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorGrossProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-gross_profit)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-gross_profit)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                    name === 'net_profit' ? 'Net Profit' : name === 'gross_profit' ? 'Gross Profit' : 'Revenue'
                  ]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="gross_profit"
              stackId="1"
              stroke="var(--color-gross_profit)"
              fill="url(#colorGrossProfit)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="net_profit"
              stackId="2"
              stroke="var(--color-net_profit)"
              fill="url(#colorNetProfit)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

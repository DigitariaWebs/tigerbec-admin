"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { carSalesApi } from "@/lib/api/car-sales"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, } from "recharts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, } from "lucide-react"

const chartConfig = {
  sales: {
    label: "Sales Count",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  gross_profit: {
    label: "Gross Profit",
    color: "hsl(var(--chart-3))",
  },
  net_profit: {
    label: "Net Profit",
    color: "hsl(var(--chart-4))",
  },
}

export function CarSalesCharts() {
  const [timeRange, setTimeRange] = useState("12m")

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
          <CardTitle>Car Sales Overview</CardTitle>
          <CardDescription>Monthly sales performance and revenue</CardDescription>
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
          <CardTitle>Car Sales Overview</CardTitle>
          <CardDescription>Monthly sales performance and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No sales data available</p>
        </CardContent>
      </Card>
    )
  }

  // Group sales by month
  const monthlySales = sales.reduce((acc, sale) => {
    const date = new Date(sale.sold_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        sales: 0,
        revenue: 0,
        gross_profit: 0,
        net_profit: 0,
      }
    }

    acc[monthKey].sales += 1
    acc[monthKey].revenue += sale.sold_price
    acc[monthKey].gross_profit += sale.profit
    acc[monthKey].net_profit += sale.net_profit || 0

    return acc
  }, {} as Record<string, { month: string; sales: number; revenue: number; gross_profit: number; net_profit: number }>)

  // Convert to array and sort by month
  const monthsToShow = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : timeRange === "1y" ? 12 : timeRange === "12m" ? 12 : timeRange === "2y" ? 24 : timeRange === "5y" ? 60 : 9999
  const chartData = Object.entries(monthlySales)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(timeRange === "lifetime" ? 0 : -monthsToShow)
    .map(([, data]) => data)

  // Calculate totals
  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.sold_price, 0)
  const totalGrossProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)
  const totalNetProfit = sales.reduce((sum, sale) => sum + (sale.net_profit || 0), 0)

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Car Sales Overview</CardTitle>
            <CardDescription>
              {timeRange === "3m" ? "Last 3 months" : timeRange === "6m" ? "Last 6 months" : timeRange === "1y" || timeRange === "12m" ? "Last 12 months" : timeRange === "2y" ? "Last 2 years" : timeRange === "5y" ? "Last 5 years" : "All-time"} performance
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
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold">{totalSales}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Sales</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-blue-600">
              ${(totalRevenue / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1">Revenue</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-orange-600">
              ${(totalGrossProfit / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1">Gross Profit</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-green-600">
              ${(totalNetProfit / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1">Net Profit</p>
          </div>
        </div>

        {/* Bar Chart */}
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === 'sales') return [`${value} `, 'Sales']
                    if (name === 'revenue') return [`$${Number(value).toLocaleString()}`, 'Revenue']
                    if (name === 'profit') return [`$${Number(value).toLocaleString()}`, 'Profit']
                    return [value, name]
                  }}
                />
              }
            />
            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

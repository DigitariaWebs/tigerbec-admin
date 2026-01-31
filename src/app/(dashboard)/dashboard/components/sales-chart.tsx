"use client"

import { useState, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { CarSale } from "@/lib/api/car-sales"

interface SalesChartProps {
  carSales: CarSale[]
  isLoading?: boolean
}

const chartConfig = {
  sales: {
    label: "Sales Revenue",
    color: "var(--primary)",
  },
  profit: {
    label: "Profit",
    color: "var(--chart-2)",
  },
}

export function SalesChart({ carSales, isLoading }: SalesChartProps) {
  const [timeRange, setTimeRange] = useState("12m")

  const chartData = useMemo(() => {
    if (!carSales || carSales.length === 0) return []

    const now = new Date()
    let cutoffDate: Date | null = null

    // Calculate cutoff date based on time range
    if (timeRange !== "lifetime") {
      cutoffDate = new Date(now)
      if (timeRange === "3m") {
        cutoffDate.setMonth(now.getMonth() - 3)
      } else if (timeRange === "6m") {
        cutoffDate.setMonth(now.getMonth() - 6)
      } else if (timeRange === "12m") {
        cutoffDate.setMonth(now.getMonth() - 12)
      } else if (timeRange === "2y") {
        cutoffDate.setFullYear(now.getFullYear() - 2)
      } else if (timeRange === "5y") {
        cutoffDate.setFullYear(now.getFullYear() - 5)
      }
    }

    // Filter sales by date range
    const filteredSales = cutoffDate 
      ? carSales.filter(sale => new Date(sale.sold_date) >= cutoffDate)
      : carSales

    // Group sales by month
    const monthlyData: Record<string, { sales: number; profit: number; count: number; date: Date }> = {}
    
    filteredSales.forEach((sale) => {
      const date = new Date(sale.sold_date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sales: 0, profit: 0, count: 0, date }
      }
      
      monthlyData[monthKey].sales += sale.sold_price
      monthlyData[monthKey].profit += sale.profit
      monthlyData[monthKey].count += 1
    })

    // Convert to array and sort by date
    const sortedData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: month,
        sales: Math.round(data.sales),
        profit: Math.round(data.profit),
        count: data.count,
        sortDate: data.date
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(({ month, sales, profit, count }) => ({ month, sales, profit, count }))

    return sortedData
  }, [carSales, timeRange])

  if (isLoading) {
    return (
      <Card className="cursor-pointer animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Monthly car sales and profit</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <div className="px-6 pb-6 h-[350px] bg-muted/20 rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>Monthly car sales and profit</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m" className="cursor-pointer">Last 3 months</SelectItem>
              <SelectItem value="6m" className="cursor-pointer">Last 6 months</SelectItem>
              <SelectItem value="12m" className="cursor-pointer">Last 12 months</SelectItem>
              <SelectItem value="2y" className="cursor-pointer">Last 2 years</SelectItem>
              <SelectItem value="5y" className="cursor-pointer">Last 5 years</SelectItem>
              <SelectItem value="lifetime" className="cursor-pointer">Lifetime</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="cursor-pointer">
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="px-6 pb-6">
          {chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No sales data available
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="var(--color-sales)"
                  fill="url(#colorSales)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stackId="2"
                  stroke="var(--color-profit)"
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

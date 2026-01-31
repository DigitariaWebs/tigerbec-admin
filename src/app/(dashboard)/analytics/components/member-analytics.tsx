"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api/analytics"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"

const chartConfig = {
  profit_ratio: {
    label: "Profit Ratio",
    color: "hsl(var(--chart-3))",
  },
  member_count: {
    label: "Members",
    color: "hsl(var(--chart-4))",
  },
}

export function MemberAnalytics() {
  const [timeRange, setTimeRange] = useState("12m")

  const { data: ageBandData, isLoading, error } = useQuery({
    queryKey: ['age-band-analytics'],
    queryFn: () => analyticsApi.getAgeBandAnalytics(),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Member Demographics</CardTitle>
          <CardDescription>Performance by age groups</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error || !ageBandData || ageBandData.length === 0) {
    return (
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Member Demographics</CardTitle>
          <CardDescription>Performance by age groups</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {error ? 'Unable to load analytics data. Please check backend configuration.' : 'No member analytics available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort age bands in logical order
  const sortedData = [...ageBandData].sort((a, b) => {
    const order = ['18-25', '26-35', '36-45', '46-55', '56+']
    return order.indexOf(a.age_band) - order.indexOf(b.age_band)
  })

  const totalMembers = sortedData.reduce((sum, band) => sum + band.member_count, 0)
  const avgProfitRatio = sortedData.reduce((sum, band) => sum + band.profit_ratio, 0) / sortedData.length

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Member Demographics</CardTitle>
            <CardDescription>Performance across age groups</CardDescription>
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold">{totalMembers}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Members</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-green-600">{avgProfitRatio.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Avg. Profit Ratio</p>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="age_band"
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === 'profit_ratio') return [`${Number(value).toFixed(1)}%`, 'Profit Ratio']
                    if (name === 'member_count') return [`${value} `, 'Members']
                    return [value, name]
                  }}
                />
              }
            />
            <Bar
              yAxisId="left"
              dataKey="profit_ratio"
              fill="var(--color-profit_ratio)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="member_count"
              fill="var(--color-member_count)"
              radius={[4, 4, 0, 0]}
              opacity={0.5}
            />
          </BarChart>
        </ChartContainer>

        {/* Age Band Details */}
        <div className="mt-4 space-y-2">
          {sortedData.map((band) => (
            <div
              key={band.age_band}
              className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium">{band.age_band} years</span>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{band.member_count} members</span>
                <span className="text-green-600 font-semibold">{band.profit_ratio.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

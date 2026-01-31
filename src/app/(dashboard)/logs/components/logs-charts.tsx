"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, CheckCircle2, XCircle, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface LogsChartsProps {
  summary?: {
    total_activities: number
    success_rate: number
    activities_by_type: Record<string, number>
    activities_by_resource: Record<string, number>
    activities_by_status: Record<string, number>
  }
  isLoading: boolean
}

export function LogsCharts({ summary, isLoading }: LogsChartsProps) {
  const [timeRange, setTimeRange] = useState("12m")
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const activitiesByTypeData = Object.entries(summary.activities_by_type || {}).map(
    ([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    })
  )

  const activitiesByResourceData = Object.entries(summary.activities_by_resource || {}).map(
    ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    })
  )

  const activitiesByStatusData = Object.entries(summary.activities_by_status || {}).map(
    ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    })
  )

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']
  const STATUS_COLORS = {
    Success: 'hsl(var(--chart-1))',
    Failure: 'hsl(var(--destructive))',
  }

  const chartConfig: ChartConfig = {
    value: {
      label: "Activities",
    },
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m" className="cursor-pointer">Last 3 months</SelectItem>
            <SelectItem value="6m" className="cursor-pointer">Last 6 months</SelectItem>
            <SelectItem value="12m" className="cursor-pointer">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary.total_activities || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All tracked activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary.success_rate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Successful operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Activities</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(summary.activities_by_status?.failure || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((1 - (summary.success_rate || 0) / 100) * 100).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activities by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Activities by Type</CardTitle>
            <CardDescription>Distribution of activity types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={activitiesByTypeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs"
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Activities by Resource */}
        <Card>
          <CardHeader>
            <CardTitle>Activities by Resource</CardTitle>
            <CardDescription>Resource type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={activitiesByResourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--chart-1))"
                  dataKey="value"
                >
                  {activitiesByResourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Success vs Failure */}
        <Card>
          <CardHeader>
            <CardTitle>Success vs Failure</CardTitle>
            <CardDescription>Activity status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={activitiesByStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                >
                  {activitiesByStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[0]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Top Activities</CardTitle>
            <CardDescription>Most frequent activity types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activitiesByTypeData
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((activity, index) => {
                  const total = activitiesByTypeData.reduce((sum, item) => sum + item.value, 0)
                  const percentage = ((activity.value / total) * 100).toFixed(1)
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{activity.name}</span>
                        <span className="text-muted-foreground">
                          {activity.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Most Active Resource</p>
              <p className="text-2xl font-bold">
                {activitiesByResourceData.length > 0
                  ? activitiesByResourceData.reduce((max, item) =>
                      item.value > max.value ? item : max
                    ).name
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Most Common Activity</p>
              <p className="text-2xl font-bold">
                {activitiesByTypeData.length > 0
                  ? activitiesByTypeData.reduce((max, item) =>
                      item.value > max.value ? item : max
                    ).name
                  : "N/A"}
              </p>
            </div>
          </div>
          {(summary.success_rate || 0) < 90 && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                ⚠️ Success rate is below 90%. Consider investigating recent failures.
              </p>
            </div>
          )}
          {(summary.success_rate || 0) >= 95 && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ Excellent! Success rate is above 95%.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

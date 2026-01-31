"use client"

import { useQuery } from "@tanstack/react-query"
import { logsApi, type LogsQueryParams } from "@/lib/api/logs"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogsFilters } from "./components/logs-filters"
import { LogsTable } from "./components/logs-table"
import { LogsCharts } from "./components/logs-charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, BarChart3, Table2 } from "lucide-react"

export default function LogsPage() {
  const [filters, setFilters] = useState<LogsQueryParams>({
    limit: 50,
    offset: 0,
  })

  // Fetch activity logs
  const { 
    data: logsData, 
    isLoading: logsLoading, 
    error: logsError 
  } = useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => logsApi.getActivityLogs(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch activity summary for charts
  const { 
    data: summaryData, 
    isLoading: summaryLoading 
  } = useQuery({
    queryKey: ['activity-summary', filters.start_date, filters.end_date],
    queryFn: () => logsApi.getActivitySummary({
      start_date: filters.start_date,
      end_date: filters.end_date,
    }),
    refetchInterval: 30000,
  })

  const handleFilterChange = (newFilters: Partial<LogsQueryParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset offset when filters change
    }))
  }

  const handlePageChange = (offset: number) => {
    setFilters(prev => ({
      ...prev,
      offset,
    }))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor all system activities and track user actions
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Real-time monitoring</span>
        </div>
      </div>

      {/* Filters */}
      <LogsFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />

      {/* Tabs for different views */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table" className="gap-2">
            <Table2 className="h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                {logsLoading ? 'Loading...' : logsData?.logs ? `Showing ${logsData.logs.length} of ${logsData.total} logs` : 'No logs found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsError && (
                <div className="text-center py-8 text-destructive">
                  <p>Failed to load logs: {logsError.message}</p>
                </div>
              )}
              <LogsTable
                logs={logsData?.logs || []}
                total={logsData?.total || 0}
                limit={filters.limit || 50}
                offset={filters.offset || 0}
                isLoading={logsLoading}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          <LogsCharts
            summary={summaryData}
            isLoading={summaryLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

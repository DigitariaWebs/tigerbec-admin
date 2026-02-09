"use client"

import { useQuery } from "@tanstack/react-query"
import { MetricsOverview } from "./components/metrics-overview"
import { SalesChart } from "./components/sales-chart"
import { RecentTransactions } from "./components/recent-transactions"
import { TopProducts } from "./components/top-products"
import { CustomerInsights } from "./components/customer-insights"
import { QuickActions } from "./components/quick-actions"
import { RevenueBreakdown } from "./components/revenue-breakdown"
import { TasksCard } from "./components/tasks-card"
import { analyticsApi } from "@/lib/api/analytics"
import { carSalesApi } from "@/lib/api/car-sales"
import type { GlobalKPIs, AgeBandAnalytics, MemberProfitData } from "@/types"
import type { CarSale } from "@/lib/api/car-sales"

interface DashboardData {
  globalKPIs: GlobalKPIs
  memberProfitData: MemberProfitData[]
  ageBandData: AgeBandAnalytics[]
  carSales: CarSale[]
}

export default function Dashboard2() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const [globalKPIs, memberProfitData, ageBandData, carSales] = await Promise.all([
        analyticsApi.getGlobalKPIs(),
        analyticsApi.getMemberProfitData(),
        analyticsApi.getAgeBandAnalytics(),
        carSalesApi.list(),
      ])

      return {
        globalKPIs,
        memberProfitData,
        ageBandData,
        carSales,
      }
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })

  // Default empty data structure to prevent null checks everywhere
  const dashboardData: DashboardData = data || {
    globalKPIs: {
      total_invested: '0',
      total_profit: '0',
      total_franchise_fees: '0',
      total_cars_bought: 0,
      total_cars_sold: 0,
      total_members: 0,
      average_profit_ratio: 0,
    },
    memberProfitData: [],
    ageBandData: [],
    carSales: [],
  }

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      {/* Enhanced Header */}
      <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Business Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your business performance and key metrics in real-time
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Main Dashboard Grid */}
      <div className="@container/main space-y-6">
        {/* Top Row - Key Metrics */}
        <MetricsOverview data={dashboardData.globalKPIs} isLoading={isLoading} />

        {/* Second Row - Charts in 6-6 columns */}
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <SalesChart carSales={dashboardData.carSales} isLoading={isLoading} />
          <RevenueBreakdown ageBandData={dashboardData.ageBandData} isLoading={isLoading} />
        </div>

        {/* Third Row - Two Column Layout */}
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <RecentTransactions carSales={dashboardData.carSales} isLoading={isLoading} />
          <TopProducts memberProfitData={dashboardData.memberProfitData} isLoading={isLoading} />
        </div>

        {/* Fourth Row - Tasks */}
        <div className="grid gap-6 grid-cols-1">
          <TasksCard />
        </div>

        {/* Fifth Row - Customer Insights */}
        <CustomerInsights
          ageBandData={dashboardData.ageBandData}
          memberProfitData={dashboardData.memberProfitData}
          totalMembers={dashboardData.globalKPIs.total_members}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

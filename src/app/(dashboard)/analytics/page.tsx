import { KPIMetrics } from "./components/kpi-metrics"
import { TopMembersPerformance } from "./components/top-members-performance"
import { CarSalesCharts } from "./components/car-sales-charts"
import { MemberAnalytics } from "./components/member-analytics"
import { BestSellingCars } from "./components/best-selling-cars"
import { ProfitTrendChart } from "./components/profit-trend-chart"

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into performance, sales, and member data
        </p>
      </div>

      {/* Main Analytics Grid */}
      <div className="@container/main space-y-6">
        {/* Top Row - Key Performance Indicators */}
        <KPIMetrics />

        {/* Second Row - Top Members */}
        <TopMembersPerformance />

        {/* Third Row - Sales and Profit Charts */}
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <CarSalesCharts />
          <ProfitTrendChart />
        </div>

        {/* Fourth Row - Member Analytics and Best Cars */}
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <MemberAnalytics />
          <BestSellingCars />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { carSalesApi } from "@/lib/api/car-sales"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, DollarSign } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function BestSellingCars() {
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
          <CardTitle>Best Selling Cars</CardTitle>
          <CardDescription>Top performing vehicle models</CardDescription>
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
          <CardTitle>Best Selling Cars</CardTitle>
          <CardDescription>Top performing vehicle models</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No sales data available</p>
        </CardContent>
      </Card>
    )
  }

  interface ModelStats {
    model: string;
    make?: string;
    count: number;
    totalGrossProfit: number;
    totalNetProfit: number;
    totalRevenue: number;
    avgGrossProfit: number;
    avgNetProfit: number;
    avgYear: number;
    years: number[];
  }

  interface TopCar extends Omit<ModelStats, 'years'> {
    profitMargin: number;
    years: number[];
  }

  // Group by model and calculate stats
  const modelStats = sales.reduce((acc, sale) => {
    const model = `${sale.make_snapshot} ${sale.model_snapshot}`

    if (!acc[model]) {
      acc[model] = {
        model,
        make: sale.make_snapshot,
        count: 0,
        totalGrossProfit: 0,
        totalNetProfit: 0,
        totalRevenue: 0,
        avgGrossProfit: 0,
        avgNetProfit: 0,
        avgYear: 0,
        years: [] as number[],
      }
    }

    acc[model].count += 1
    acc[model].totalGrossProfit += sale.profit
    acc[model].totalNetProfit += sale.net_profit || 0
    acc[model].totalRevenue += sale.sold_price
    acc[model].years.push(sale.year_snapshot)

    return acc
  }, {} as Record<string, ModelStats>)

  // Calculate averages and sort
  const topCars = Object.values(modelStats)
    .map((car: ModelStats): TopCar => ({
      ...car,
      avgGrossProfit: car.totalGrossProfit / car.count,
      avgNetProfit: car.totalNetProfit / car.count,
      avgYear: Math.round(car.years.reduce((a: number, b: number) => a + b, 0) / car.years.length),
      profitMargin: (car.totalNetProfit / car.totalRevenue) * 100,
    }))
    .sort((a: TopCar, b: TopCar) => b.totalNetProfit - a.totalNetProfit)
    .slice(0, 5)

  const maxCount = Math.max(...topCars.map((car: TopCar) => car.count))

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Best Selling Cars</CardTitle>
            <CardDescription>Top 5 models by net profit performance</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCars.map((car: TopCar, index: number) => {
            const profitPercentage = (car.count / maxCount) * 100

            return (
              <div
                key={car.model}
                className="space-y-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <h4 className="font-semibold">{car.model}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg. Year: {car.avgYear}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="text-right">
                      ${(car.totalGrossProfit / 1000).toFixed(1)}K
                    </div>
                    <p className="text-xs text-muted-foreground">Gross Profit</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="text-right text-green-600 font-semibold">
                      ${(car.totalNetProfit / 1000).toFixed(1)}K
                    </div>
                    <p className="text-xs text-muted-foreground">Net Profit</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{car.count} sold</span>
                    <span>{profitPercentage.toFixed(0)}% of top</span>
                  </div>
                  <Progress value={profitPercentage} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Avg Profit</span>
                    </div>
                    <p className="text-sm font-semibold">
                      ${(car.avgNetProfit / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div className="text-center border-x">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Margin</span>
                    </div>
                    <p className="text-sm font-semibold text-green-600">
                      {car.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>Revenue</span>
                    </div>
                    <p className="text-sm font-semibold">
                      ${(car.totalRevenue / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">
                {topCars.reduce((sum: number, car: TopCar) => sum + car.count, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Units Sold</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                ${(topCars.reduce((sum: number, car: TopCar) => sum + car.totalNetProfit, 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground mt-1">Combined Profit</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

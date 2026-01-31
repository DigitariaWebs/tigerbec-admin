"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, Cell } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { AgeBandAnalytics } from "@/types"

interface RevenueBreakdownProps {
  ageBandData: AgeBandAnalytics[]
  isLoading?: boolean
}

const generateChartConfig = (data: AgeBandAnalytics[]) => {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
  const config: Record<string, { label: string; color: string }> = {
    profit: { label: "Profit", color: "var(--primary)" },
  }
  
  data.forEach((item, index) => {
    const key = item.age_band.toLowerCase().replace(/[^a-z0-9]/g, '_')
    config[key] = {
      label: item.age_band,
      color: colors[index % colors.length],
    }
  })
  
  return config
}

export function RevenueBreakdown({ ageBandData, isLoading }: RevenueBreakdownProps) {
  const id = "revenue-breakdown"
  
  const chartData = React.useMemo(() => {
    if (!ageBandData || ageBandData.length === 0) return []
    
    return ageBandData.map((item) => ({
      ageBand: item.age_band,
      key: item.age_band.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      profit: parseFloat(item.total_profit),
      profitRatio: item.profit_ratio,
      carsPurchased: item.cars_purchased,
      memberCount: item.member_count,
      fill: `var(--color-${item.age_band.toLowerCase().replace(/[^a-z0-9]/g, '_')})`,
    }))
  }, [ageBandData])

  const [activeCategory, setActiveCategory] = React.useState(chartData[0]?.key || "")
  
  React.useEffect(() => {
    if (chartData.length > 0 && !activeCategory) {
      setActiveCategory(chartData[0].key)
    }
  }, [chartData, activeCategory])

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.key === activeCategory),
    [chartData, activeCategory]
  )
  
  const chartConfig = React.useMemo(() => generateChartConfig(ageBandData), [ageBandData])

  if (isLoading) {
    return (
      <Card data-chart={id} className="flex flex-col cursor-pointer animate-pulse">
        <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
          <div>
            <CardTitle>Profit by Age Band</CardTitle>
            <CardDescription>Profit distribution across member age groups</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center">
          <div className="h-[300px] w-full bg-muted/20 rounded" />
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card data-chart={id} className="flex flex-col cursor-pointer">
        <CardHeader>
          <CardTitle>Profit by Age Band</CardTitle>
          <CardDescription>Profit distribution across member age groups</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center items-center">
          <p className="text-muted-foreground">No age band data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col cursor-pointer">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
        <div>
          <CardTitle>Profit by Age Band</CardTitle>
          <CardDescription>Profit distribution across member age groups</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger
              className="w-[175px] rounded-lg cursor-pointer"
              aria-label="Select an age band"
            >
              <SelectValue placeholder="Select age band" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-lg">
              {chartData.map((item) => (
                <SelectItem
                  key={item.key}
                  value={item.key}
                  className="rounded-md [&_span]:flex cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: item.fill,
                      }}
                    />
                    {item.ageBand}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="cursor-pointer">
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="flex justify-center">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="profit"
                  nameKey="ageBand"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={2}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const totalProfit = chartData.reduce((sum, item) => sum + item.profit, 0)
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              ${(totalProfit / 1000).toFixed(1)}K
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total Profit
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          
          <div className="flex flex-col justify-center space-y-4">
            {chartData.map((item, index) => {
              const isActive = index === activeIndex
              
              return (
                <div 
                  key={item.key}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveCategory(item.key)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: item.fill,
                      }}
                    />
                    <span className="font-medium">{item.ageBand}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${(item.profit / 1000).toFixed(1)}K</div>
                    <div className="text-sm text-muted-foreground">
                      {item.memberCount} members • {item.carsPurchased} cars
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

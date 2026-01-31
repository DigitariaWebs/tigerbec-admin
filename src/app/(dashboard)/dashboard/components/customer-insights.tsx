"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Target, ArrowUpIcon, UserIcon, Percent } from "lucide-react"
import type { AgeBandAnalytics, MemberProfitData } from "@/types"

interface CustomerInsightsProps {
  ageBandData: AgeBandAnalytics[]
  memberProfitData: MemberProfitData[]
  totalMembers: number
  isLoading?: boolean
}

const chartConfig = {
  profit: {
    label: "Total Profit",
    color: "var(--chart-1)",
  },
  cars: {
    label: "Cars Purchased",
    color: "var(--chart-2)",
  },
  members: {
    label: "Members",
    color: "var(--chart-3)",
  },
}

export function CustomerInsights({ ageBandData, memberProfitData, totalMembers, isLoading }: CustomerInsightsProps) {
  const [activeTab, setActiveTab] = useState("demographics")

  if (isLoading) {
    return (
      <Card className="h-fit animate-pulse">
        <CardHeader>
          <CardTitle>Member Insights</CardTitle>
          <CardDescription>Age demographics and top performers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted/20 rounded" />
        </CardContent>
      </Card>
    )
  }

  const totalProfit = memberProfitData.reduce((sum, m) => sum + parseFloat(m.profit), 0)
  const totalInvested = memberProfitData.reduce((sum, m) => sum + parseFloat(m.total_invested), 0)
  const avgProfitRatio = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Member Insights</CardTitle>
        <CardDescription>Age demographics and performance analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-12">
            <TabsTrigger
              value="demographics"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Age Demographics</span>
            </TabsTrigger>
            <TabsTrigger
              value="top-performers"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Top Performers</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demographics" className="mt-8 space-y-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-10 gap-6">
                <div className="col-span-10 xl:col-span-7">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">Profit by Age Band</h3>
                  <ChartContainer config={chartConfig} className="h-[375px] w-full">
                    <BarChart data={ageBandData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="age_band"
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'var(--border)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'var(--border)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                        domain={[0, 'auto']}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="total_profit" 
                        fill="var(--color-profit)" 
                        radius={[4, 4, 0, 0]}
                        name="Total Profit"
                      />
                    </BarChart>
                  </ChartContainer>
                </div>

                <div className="col-span-10 xl:col-span-3 space-y-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">Key Metrics</h3>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="p-4 rounded-lg max-lg:col-span-3 xl:col-span-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Total Members</span>
                      </div>
                      <div className="text-2xl font-bold">{totalMembers}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Active CRM members
                      </div>
                    </div>

                    <div className="p-4 rounded-lg max-lg:col-span-3 xl:col-span-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Total Profit</span>
                      </div>
                      <div className="text-2xl font-bold">${(totalProfit / 1000).toFixed(1)}K</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Combined earnings
                      </div>
                    </div>

                    <div className="p-4 rounded-lg max-lg:col-span-3 xl:col-span-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Avg ROI</span>
                      </div>
                      <div className="text-2xl font-bold">{avgProfitRatio.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Average return
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card mt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="py-5 px-6 font-semibold">Age Band</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Members</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Cars Purchased</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Total Profit</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Avg ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ageBandData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-5 px-6">{row.age_band}</TableCell>
                      <TableCell className="text-right py-5 px-6">{row.member_count}</TableCell>
                      <TableCell className="text-right py-5 px-6">{row.cars_purchased}</TableCell>
                      <TableCell className="text-right py-5 px-6">
                        ${parseFloat(row.total_profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right py-5 px-6">
                        <span className={`font-medium ${row.profit_ratio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.profit_ratio.toFixed(2)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="top-performers" className="mt-8">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="py-5 px-6 font-semibold">Rank</TableHead>
                    <TableHead className="py-5 px-6 font-semibold">Member Name</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Total Invested</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Profit</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberProfitData.slice(0, 10).map((row, index) => {
                    const profit = parseFloat(row.profit)
                    return (
                      <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium py-5 px-6">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            #{index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium py-5 px-6">{row.member_name}</TableCell>
                        <TableCell className="text-right py-5 px-6">
                          ${parseFloat(row.total_invested).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right py-5 px-6">
                          ${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right py-5 px-6">
                          <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {row.profit_ratio.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
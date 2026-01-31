"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api/analytics"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Trophy, Award, Medal, Star } from "lucide-react"

export function TopMembersPerformance() {
  const { data: memberProfitData, isLoading, error } = useQuery({
    queryKey: ['member-profit-data'],
    queryFn: () => analyticsApi.getMemberProfitData(),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Top Performing Members</CardTitle>
          <CardDescription>Best 5 members by profit performance</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error || !memberProfitData || memberProfitData.length === 0) {
    return (
      <Card className="cursor-pointer">
        <CardHeader>
          <CardTitle>Top Performing Members</CardTitle>
          <CardDescription>Best 5 members by profit performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {error ? 'Unable to load member data. Please check backend configuration.' : 'No member data available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Get top 5 members by profit
  const topMembers = [...memberProfitData]
    .sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit))
    .slice(0, 5)

  const rankIcons = [Trophy, Award, Medal, Star, TrendingUp]
  const rankColors = [
    "text-yellow-500 bg-yellow-500/10",
    "text-gray-400 bg-gray-400/10",
    "text-amber-700 bg-amber-700/10",
    "text-blue-500 bg-blue-500/10",
    "text-purple-500 bg-purple-500/10",
  ]

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Performing Members</CardTitle>
            <CardDescription>Best 5 members by profit performance</CardDescription>
          </div>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topMembers.map((member, index) => {
            const RankIcon = rankIcons[index]
            const rankColor = rankColors[index]
            const profit = parseFloat(member.profit)
            const invested = parseFloat(member.total_invested)
            const profitRatio = member.profit_ratio

            return (
              <div
                key={member.member_id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank Badge */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${rankColor}`}>
                    <RankIcon className="h-5 w-5" />
                  </div>

                  {/* Member Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {member.member_name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{member.member_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Invested: ${invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      +${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Profit</p>
                  </div>
                  <Badge
                    variant={profitRatio > 20 ? "default" : profitRatio > 10 ? "secondary" : "outline"}
                    className="min-w-[60px] justify-center"
                  >
                    {profitRatio.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">
                ${topMembers.reduce((sum, m) => sum + parseFloat(m.profit), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Combined Profit</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(topMembers.reduce((sum, m) => sum + m.profit_ratio, 0) / topMembers.length).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg. Return</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${topMembers.reduce((sum, m) => sum + parseFloat(m.total_invested), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Invested</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

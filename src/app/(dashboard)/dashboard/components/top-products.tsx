"use client"

import { Eye, TrendingUp, Users as UsersIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { MemberProfitData } from "@/types"

interface TopMembersProps {
  memberProfitData: MemberProfitData[]
  isLoading?: boolean
}

export function TopProducts({ memberProfitData, isLoading }: TopMembersProps) {
  if (isLoading) {
    return (
      <Card className="cursor-pointer animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Top Performing Members</CardTitle>
            <CardDescription>Members with highest profits</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center p-3 rounded-lg border gap-2">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const topMembers = memberProfitData.slice(0, 5)

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Top Performing Members</CardTitle>
          <CardDescription>Members with highest profits</CardDescription>
        </div>
        <a href="/members"> 
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
        </a>
      </CardHeader>
      <CardContent className="space-y-4">
        {topMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No member data available
          </div>
        ) : (
          topMembers.map((member, index) => {
            const profit = parseFloat(member.profit)
            const invested = parseFloat(member.total_invested)
            const profitRatio = member.profit_ratio
            
            return (
              <div key={member.member_id} className="flex items-center p-3 rounded-lg border gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  #{index + 1}
                </div>
                <div className="flex gap-2 items-center justify-between space-x-3 flex-1 flex-wrap">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">{member.member_name}</p>
                      <Badge variant="outline" className="text-xs">
                        <UsersIcon className="h-3 w-3 mr-1" />
                        Member
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Invested: ${invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">
                        ${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <Badge
                        variant="outline"
                        className={`${profit >= 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'} cursor-pointer`}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {profitRatio.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">ROI</span>
                      <Progress
                        value={Math.min(profitRatio, 100)}
                        className="w-12 h-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

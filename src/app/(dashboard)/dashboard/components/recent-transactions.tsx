"use client"

import { Eye, MoreHorizontal, Car as CarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { CarSale } from "@/lib/api/car-sales"
import { formatDistanceToNow } from "date-fns"

interface RecentTransactionsProps {
  carSales: CarSale[]
  isLoading?: boolean
}

export function RecentTransactions({ carSales, isLoading }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card className="cursor-pointer animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest car sales</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex p-3 rounded-lg border gap-2">
              <div className="h-8 w-8 bg-muted rounded-full" />
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

  const recentSales = carSales.slice(0, 5)

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest car sales</CardDescription>
        </div>
        <a href="/car-sales"> 
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
        </a>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          recentSales.map((sale) => {
            const profit = sale.profit
            const profitRatio = sale.purchase_price_snapshot > 0 
              ? ((profit / sale.purchase_price_snapshot) * 100).toFixed(1)
              : "0"
            const isProfit = profit >= 0

            return (
              <div key={sale.id}>
                <div className="flex p-3 rounded-lg border gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <CarIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 items-center flex-wrap justify-between gap-1">
                    <div className="flex items-center space-x-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {sale.year_snapshot} {sale.make_snapshot} {sale.model_snapshot}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          VIN: {sale.vin_snapshot.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={isProfit ? "default" : "destructive"}
                        className="cursor-pointer"
                      >
                        {isProfit ? "+" : ""}{profitRatio}% ROI
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${sale.sold_price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(sale.sold_date), { addSuffix: true })}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">View Details</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">View Member</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">View Car History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

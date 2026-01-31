"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { carSalesApi, type CarSale } from "@/lib/api/car-sales"
import { membersApi } from "@/lib/api/members"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import type { MemberStats } from "@/types"

export interface CarSaleFilters {
  member_id?: string
  make?: string
  model?: string
  year?: number
  start_date?: string
  end_date?: string
  min_profit?: number
  max_profit?: number
}

export interface CarSaleStats {
  total_sales: number
  total_revenue: number
  total_profit: number
  average_profit: number
  average_profit_ratio: number
}

export default function CarSalesPage() {
  const [filters, setFilters] = useState<CarSaleFilters>({})
  
  // Fetch all car sales
  const { 
    data: allSales = [], 
    isLoading: salesLoading,
  } = useQuery<CarSale[]>({
    queryKey: ['car-sales'],
    queryFn: () => carSalesApi.list(),
    staleTime: 30000, // 30 seconds
  })

  // Fetch members for filter dropdown
  const { data: membersData = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const members = await membersApi.getAll()
      return members.map((member) => ({
        user_id: member.user_id || member.id || '',
        name: member.name || 'Unknown User',
      }))
    },
    staleTime: 60000, // 1 minute
  })

  // Filter sales on the client side
  const filteredSales = useMemo(() => {
    return allSales.filter(sale => {
      // Filter by member
      if (filters.member_id && sale.member_id !== filters.member_id) {
        return false
      }

      // Filter by make
      if (filters.make && sale.make_snapshot) {
        if (sale.make_snapshot.toLowerCase() !== filters.make.toLowerCase()) {
          return false
        }
      }

      // Filter by model
      if (filters.model && sale.model_snapshot !== filters.model) {
        return false
      }

      // Filter by year
      if (filters.year && sale.year_snapshot !== filters.year) {
        return false
      }

      // Filter by date range
      if (filters.start_date && sale.sold_date < filters.start_date) {
        return false
      }
      if (filters.end_date && sale.sold_date > filters.end_date) {
        return false
      }

      // Filter by profit range
      if (filters.min_profit !== undefined && sale.profit < filters.min_profit) {
        return false
      }
      if (filters.max_profit !== undefined && sale.profit > filters.max_profit) {
        return false
      }

      return true
    })
  }, [allSales, filters])

  // Calculate statistics from filtered data
  const stats = useMemo<CarSaleStats>(() => {
    if (filteredSales.length === 0) {
      return {
        total_sales: 0,
        total_revenue: 0,
        total_profit: 0,
        average_profit: 0,
        average_profit_ratio: 0,
      }
    }

    const total_revenue = filteredSales.reduce((sum, sale) => sum + sale.sold_price, 0)
    // Use net_profit (after franchise fee) for statistics
    const total_profit = filteredSales.reduce((sum, sale) => sum + (sale.net_profit || sale.profit), 0)
    const average_profit = total_profit / filteredSales.length
    const total_cost = filteredSales.reduce((sum, sale) => sum + sale.purchase_price_snapshot, 0)
    const average_profit_ratio = total_cost > 0 ? (total_profit / total_cost) * 100 : 0

    return {
      total_sales: filteredSales.length,
      total_revenue,
      total_profit,
      average_profit,
      average_profit_ratio,
    }
  }, [filteredSales])

  const handleFiltersChange = (newFilters: CarSaleFilters) => {
    // Reset "all" selections to empty string
    const cleanedFilters: CarSaleFilters = {}
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== 'all' && value !== '' && value !== null && value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cleanedFilters[key as keyof CarSaleFilters] = value as any
      }
    })
    
    setFilters(cleanedFilters)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Car Sales</h1>
        <p className="text-muted-foreground">
          View and analyze all car sales transactions with immutable historical data
        </p>
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} isLoading={salesLoading} />

      {/* Data Table with Filters */}
      <DataTable 
        data={filteredSales}
        members={membersData}
        onFiltersChange={handleFiltersChange}
        isLoading={salesLoading}
      />
    </div>
  )
}

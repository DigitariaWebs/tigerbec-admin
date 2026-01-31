"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingUp, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { useEffect, useState } from "react"
import { membersApi } from "@/lib/api/members"


export function StatCards() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const members = await membersApi.getAll()
        const memberList = Array.isArray(members) ? members : (members as { data?: unknown[] }).data || []
        setTotalUsers(memberList.length)
      } catch (error) {
        console.error("Failed to fetch members count:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTotalUsers()
  }, [])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className='border'>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Users className='text-muted-foreground size-6' />
            <Badge
              variant='outline'
              className={cn(
                'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
              )}
            >
              <>
                <TrendingUp className='me-1 size-3' />
                +12.5%
              </>
            </Badge>
          </div>

          <div className='space-y-2'>
            <p className='text-muted-foreground text-sm font-medium'>Total Users</p>
            <div className='text-2xl font-bold'>{isLoading ? '-' : totalUsers}</div>
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <span>Active members</span>
              <ArrowUpRight className='size-3' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

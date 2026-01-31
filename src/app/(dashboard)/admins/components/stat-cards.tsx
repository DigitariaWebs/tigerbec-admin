import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, Shield, Clock } from "lucide-react"
import { Admin } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardsProps {
  admins: Admin[]
  isLoading: boolean
}

export function StatCards({ admins, isLoading }: StatCardsProps) {
  const totalAdmins = admins.length
  const recentAdmins = admins.filter((admin) => {
    const createdAt = new Date(admin.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return createdAt >= thirtyDaysAgo
  }).length

  const stats = [
    {
      title: 'Total Admins',
      value: totalAdmins.toString(),
      icon: Shield,
      description: 'All admin accounts'
    },
    {
      title: 'Recent Admins',
      value: recentAdmins.toString(),
      icon: Clock,
      description: 'Added in last 30 days'
    },
    {
      title: 'Active Sessions',
      value: totalAdmins.toString(),
      icon: UserCheck,
      description: 'Currently active'
    },
    {
      title: 'System Access',
      value: '100%',
      icon: Users,
      description: 'Full admin privileges'
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((_, index) => (
          <Card key={index} className='border'>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className='space-y-2'>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className='border'>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <stat.icon className='text-muted-foreground size-6' />
            </div>

            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm font-medium'>{stat.title}</p>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-muted-foreground text-xs'>{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

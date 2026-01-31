"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { membersApi } from "@/lib/api/members"
import { Profile, MemberStats, Car, CarStatus } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Calendar, Clock, Car as CarIcon, Phone, DollarSign, TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react"
import { AddFundsModal } from "./add-funds-modal"
import { AddCarModal } from "./add-car-modal"

interface UserDetailsModalProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsModal({ userId, open, onOpenChange }: UserDetailsModalProps) {
  const queryClient = useQueryClient()
  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const [showAddCarModal, setShowAddCarModal] = useState(false)

  const { data: user, isLoading: userLoading, error: userError } = useQuery<Profile>({
    queryKey: ['member', userId],
    queryFn: () => membersApi.getById(userId!),
    enabled: !!userId && open,
  })

  const { data: stats, isLoading: statsLoading } = useQuery<MemberStats>({
    queryKey: ['member-stats', userId],
    queryFn: () => membersApi.getStats(userId!),
    enabled: !!userId && open,
  })

  const { data: cars = [], isLoading: carsLoading } = useQuery<Car[]>({
    queryKey: ['member-cars', userId],
    queryFn: () => membersApi.getCars(userId!),
    enabled: !!userId && open,
  })

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ['member-cars', userId] })
    queryClient.invalidateQueries({ queryKey: ['member-stats', userId] })
  }

  const generateAvatar = (name: string) => {
    if (!name || typeof name !== 'string') return '??'
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isLoading = userLoading || statsLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            View detailed information about this member
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : userError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-semibold">Error loading member details</p>
            <p className="text-sm">{userError instanceof Error ? userError.message : 'An error occurred'}</p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {generateAvatar(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-semibold">{user.name}</h3>
                  <Badge variant="secondary">
                    Member
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user.email || stats?.email || 'No email'}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddFundsModal(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Funds
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCarModal(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Car
                </Button>
              </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="cars">Cars ({cars.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Financial Summary */}
                {stats?.financial && (
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Financial Summary</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-full p-2 bg-blue-500/10">
                          <Wallet className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                          <p className="text-lg font-semibold">${stats.financial.totalInvestment.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-full p-2 bg-purple-500/10">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                          <p className="text-lg font-semibold">${stats.financial.totalRevenue.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-full p-2 bg-green-500/10">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Gross Profit</p>
                          <p className="text-lg font-semibold text-green-600">
                            ${stats.financial.totalGrossProfit.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats.financial.profitMargin.toFixed(1)}% margin
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-full p-2 bg-emerald-500/10">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                          <p className="text-lg font-semibold text-emerald-600">
                            ${stats.financial.totalNetProfit.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats.financial.netProfitMargin.toFixed(1)}% margin
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-full p-2 bg-orange-500/10">
                          <TrendingDown className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Franchise Fees</p>
                          <p className="text-lg font-semibold text-orange-600">
                            ${stats.financial.totalFranchiseFees.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-full p-2 bg-red-500/10">
                          <DollarSign className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Additional Expenses</p>
                          <p className="text-lg font-semibold text-red-600">
                            ${stats.financial.totalAdditionalExpenses.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Member Information</h4>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="rounded-full p-2 bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">User ID</p>
                      <p className="text-sm font-mono">{user.id || user.user_id || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="rounded-full p-2 bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                      <p className="text-sm">{user.email || stats?.email || 'Not provided'}</p>
                    </div>
                  </div>

                  {stats?.phone && (
                    <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                      <div className="rounded-full p-2 bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                        <p className="text-sm">{stats.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="rounded-full p-2 bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p className="text-sm">{new Date(user.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="rounded-full p-2 bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="text-sm">{formatDate(user.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="rounded-full p-2 bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{formatDate(user.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cars" className="space-y-4 mt-4">
                {carsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No cars found for this member</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {cars.map((car) => (
                      <div key={car.id} className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-full p-2 bg-primary/10">
                          <CarIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{car.year} {car.model}</p>
                            <Badge variant={car.status === CarStatus.SOLD ? 'default' : 'secondary'}>
                              {car.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">VIN:</span> {car.vin}
                            </div>
                            <div>
                              <span className="font-medium">Mileage:</span> {car.mileage?.toLocaleString() ?? 'N/A'} mi
                            </div>
                            <div>
                              <span className="font-medium">Purchase:</span> ${parseFloat(car.purchase_price).toLocaleString()}
                            </div>
                            {car.sale_price && (
                              <div>
                                <span className="font-medium">Sale:</span> ${parseFloat(car.sale_price).toLocaleString()}
                              </div>
                            )}
                            {car.additional_expenses !== undefined && (
                              <div>
                                <span className="font-medium">Additional Expenses:</span>
                                <span className="text-red-600">
                                  {' '}${car.additional_expenses.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {car.profit && (
                              <div>
                                <span className="font-medium">Gross Profit:</span>
                                <span className={parseFloat(car.profit) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {' '}${parseFloat(car.profit).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {car.net_profit !== undefined && (
                              <div>
                                <span className="font-medium">Net Profit:</span>
                                <span className={car.net_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                  {' '}${car.net_profit.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {car.franchise_fee !== undefined && (
                              <div>
                                <span className="font-medium">Franchise Fee:</span>
                                <span className="text-orange-600">
                                  {' '}${car.franchise_fee.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>

      {/* Add Funds Modal */}
      <AddFundsModal
        memberId={userId}
        memberName={user?.name || 'Member'}
        open={showAddFundsModal}
        onOpenChange={setShowAddFundsModal}
        onSuccess={handleRefetch}
      />

      {/* Add Car Modal */}
      <AddCarModal
        memberId={userId}
        memberName={user?.name || 'Member'}
        open={showAddCarModal}
        onOpenChange={setShowAddCarModal}
        onSuccess={handleRefetch}
      />
    </Dialog>
  )
}

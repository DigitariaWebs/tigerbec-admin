"use client"

import { useQuery } from "@tanstack/react-query"
import { carExpensesApi, type CarExpense } from "@/lib/api/car-expenses"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Receipt, Calendar, DollarSign, AlertCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ExpenseDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carId: string
  carInfo: {
    vin: string
    make: string
    model: string
    year: number
  }
  totalExpenses: number
}

export function ExpenseDetailsModal({ 
  open, 
  onOpenChange, 
  carId,
  carInfo,
  totalExpenses
}: ExpenseDetailsModalProps) {
  const { data: expenses = [], isLoading, error } = useQuery<CarExpense[]>({
    queryKey: ['car-expenses', carId],
    queryFn: () => carExpensesApi.getByCarId(carId),
    enabled: open && !!carId,
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Additional Expenses Details
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of all additional expenses for this vehicle
          </DialogDescription>
        </DialogHeader>

        {/* Car Information */}
        <div className="space-y-1 -mt-2 pb-2">
          <div className="text-sm font-medium text-foreground">
            {carInfo.year} {carInfo.make} {carInfo.model}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            VIN: {carInfo.vin}
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-muted/50 rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Additional Expenses</span>
            </div>
            <Badge 
              variant={totalExpenses > 0 ? "default" : "secondary"}
              className="text-lg px-3 py-1"
            >
              {formatCurrency(totalExpenses)}
            </Badge>
          </div>
        </div>

        {/* Expenses List */}
        <ScrollArea className="flex-1 pr-4 min-h-[200px]">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-3" />
              <p className="text-sm text-muted-foreground">
                Failed to load expenses
              </p>
              <p className="text-xs text-destructive mt-1">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No additional expenses recorded for this vehicle
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All expenses were entered before the sale was recorded
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead className="text-right w-[120px]">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{expense.description}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            ID: {expense.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(expense.expense_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="font-semibold">
                          {formatCurrency(expense.amount)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>

        {/* Footer Note */}
        {expenses.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3 border border-dashed">
            <span className="font-medium">Note:</span> These expenses were recorded before the sale
            and are included in the total cost calculation. Total from {expenses.length} expense
            {expenses.length !== 1 ? 's' : ''}.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

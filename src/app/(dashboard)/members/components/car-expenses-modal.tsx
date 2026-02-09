"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { DollarSign, Plus, Trash2, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { carExpensesApi } from "@/lib/api/car-expenses"

interface CarExpensesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carId: string
  carName: string
  purchasePrice: number
  carStatus?: string
  onSuccess?: () => void
}

export function CarExpensesModal({
  open,
  onOpenChange,
  carId,
  carName,
  purchasePrice,
  carStatus,
  onSuccess,
}: CarExpensesModalProps) {
  const queryClient = useQueryClient()
  const normalizedStatus = (carStatus || "").toUpperCase()
  const isSold = normalizedStatus === "SOLD"
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
  })

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["car-expenses", carId],
    queryFn: () => carExpensesApi.getByCarId(carId),
    enabled: open,
  })

  const { data: totalData } = useQuery({
    queryKey: ["car-expenses-total", carId],
    queryFn: () => carExpensesApi.getTotalExpenses(carId),
    enabled: open,
  })

  const totalExpenses = totalData?.total_expenses || 0
  const totalCost = purchasePrice + totalExpenses

  const createMutation = useMutation({
    mutationFn: carExpensesApi.create.bind(carExpensesApi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-expenses", carId] })
      queryClient.invalidateQueries({ queryKey: ["car-expenses-total", carId] })
      queryClient.invalidateQueries({ queryKey: ["member-cars"] })
      toast.success("Expense added successfully")
      setIsAddingExpense(false)
      setFormData({
        amount: "",
        description: "",
        expense_date: format(new Date(), "yyyy-MM-dd"),
      })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add expense")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: carExpensesApi.delete.bind(carExpensesApi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-expenses", carId] })
      queryClient.invalidateQueries({ queryKey: ["car-expenses-total", carId] })
      queryClient.invalidateQueries({ queryKey: ["member-cars"] })
      toast.success("Expense deleted successfully")
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete expense")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    createMutation.mutate({
      car_id: carId,
      amount: parseFloat(formData.amount),
      description: formData.description,
      expense_date: formData.expense_date,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] md:max-w-[80vw] lg:max-w-[80vw] max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Additional Expenses - {carName}</DialogTitle>
          <DialogDescription>
            {isSold ? "View expenses for this sold vehicle (read-only)" : "Manage additional expenses for this vehicle"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Purchase Price</p>
            <p className="text-lg font-semibold">
              ${purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Additional Expenses</p>
            <p className="text-lg font-semibold text-orange-600">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold text-primary">
              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {!isSold && (
          isAddingExpense ? (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense_date">Date</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expense_date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Repairs, Maintenance, Parts..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Expense"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingExpense(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setIsAddingExpense(true)} className="w-full">
              <Plus className="size-4 mr-2" />
              Add Expense
            </Button>
          )
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Expense History</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading expenses...
            </p>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No expenses recorded yet
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {!isSold && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="size-3 text-muted-foreground" />
                          {format(new Date(expense.expense_date), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-2xl break-words whitespace-normal">
                          {expense.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="size-3" />
                          {expense.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </TableCell>
                      {!isSold && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(expense.id)}
                            disabled={deleteMutation.isPending}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

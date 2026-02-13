"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { DollarSign } from "lucide-react"
import { carSalesApi } from "@/lib/api/car-sales"
import type { Car } from "@/types"

const markCarSoldSchema = z.object({
  sold_price: z.number().min(0.01, {
    message: "Sold price must be greater than 0",
  }),
  sold_date: z.string().min(1, {
    message: "Sold date is required",
  }),
})

type MarkCarSoldFormValues = z.infer<typeof markCarSoldSchema>

interface MarkCarSoldModalProps {
  memberId: string | null
  car: Car | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function MarkCarSoldModal({
  memberId,
  car,
  open,
  onOpenChange,
  onSuccess,
}: MarkCarSoldModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const purchasePrice = useMemo(
    () => (car?.purchase_price ? Number.parseFloat(car.purchase_price) || 0 : 0),
    [car?.purchase_price],
  )

  const form = useForm<MarkCarSoldFormValues>({
    resolver: zodResolver(markCarSoldSchema),
    defaultValues: {
      sold_price: 0,
      sold_date: new Date().toISOString().split("T")[0],
    },
  })

  async function onSubmit(values: MarkCarSoldFormValues) {
    if (!memberId || !car) return

    setIsSubmitting(true)
    try {
      await carSalesApi.create({
        car_id: car.id,
        member_id: memberId,
        sold_price: values.sold_price,
        sold_date: values.sold_date,
      })

      toast.success("Car marked as sold successfully")
      onOpenChange(false)
      form.reset({
        sold_price: 0,
        sold_date: new Date().toISOString().split("T")[0],
      })
      onSuccess?.()
    } catch (error) {
      console.error("Failed to mark car as sold:", error)
      toast.error(`Failed to mark car as sold: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!car) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Mark Car as Sold
          </DialogTitle>
          <DialogDescription>
            Record the sale details for <strong>{car.year} {car.make || ""} {car.model}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-3 text-sm">
          <p><span className="font-medium">VIN:</span> {car.vin}</p>
          <p><span className="font-medium">Purchase Price:</span> ${purchasePrice.toLocaleString()}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sold_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sold Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sold_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sold Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Mark Sold"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

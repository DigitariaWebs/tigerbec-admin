"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { membersApi } from "@/lib/api/members"
import { toast } from "sonner"
import { MinusCircle } from "lucide-react"

const removeFundsSchema = z.object({
  amount: z.number().min(0.01, {
    message: "Amount must be at least $0.01",
  }),
  notes: z.string().optional(),
})

type RemoveFundsFormValues = z.infer<typeof removeFundsSchema>

interface RemoveFundsModalProps {
  memberId: string | null
  memberName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RemoveFundsModal({
  memberId,
  memberName,
  open,
  onOpenChange,
  onSuccess,
}: RemoveFundsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RemoveFundsFormValues>({
    resolver: zodResolver(removeFundsSchema),
    defaultValues: {
      amount: 0,
      notes: "",
    },
  })

  async function onSubmit(data: RemoveFundsFormValues) {
    if (!memberId) return

    setIsSubmitting(true)
    try {
      await membersApi.removeFunds(memberId, {
        amount: data.amount,
        notes: data.notes || undefined,
      })
      toast.success(`Successfully removed $${data.amount.toFixed(2)} from ${memberName}`)
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to remove funds:", error)
      toast.error(`Failed to remove funds: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MinusCircle className="h-5 w-5" />
            Remove Funds
          </DialogTitle>
          <DialogDescription>
            Remove funds from <strong>{memberName}</strong>&apos;s account.
            This creates an approved withdrawal ledger entry for auditability.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for this withdrawal adjustment..."
                      className="resize-none"
                      {...field}
                    />
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
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Removing..." : "Remove Funds"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

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
import { DollarSign } from "lucide-react"

const addFundsSchema = z.object({
    amount: z.number().min(0.01, {
        message: "Amount must be at least $0.01",
    }),
    notes: z.string().optional(),
})

type AddFundsFormValues = z.infer<typeof addFundsSchema>

interface AddFundsModalProps {
    memberId: string | null
    memberName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function AddFundsModal({ memberId, memberName, open, onOpenChange, onSuccess }: AddFundsModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<AddFundsFormValues>({
        resolver: zodResolver(addFundsSchema),
        defaultValues: {
            amount: 0,
            notes: "",
        },
    })

    async function onSubmit(data: AddFundsFormValues) {
        if (!memberId) return

        setIsSubmitting(true)
        try {
            await membersApi.addFunds(memberId, {
                amount: data.amount,
                notes: data.notes || undefined,
            })
            toast.success(`Successfully added $${data.amount.toFixed(2)} to ${memberName}`)
            form.reset()
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to add funds:", error)
            toast.error(`Failed to add funds: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Add Funds
                    </DialogTitle>
                    <DialogDescription>
                        Add funds directly to <strong>{memberName}</strong>&apos;s account.
                        This will be recorded as an admin-approved fund addition.
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
                                            placeholder="Enter reason or notes for this fund addition..."
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
                                {isSubmitting ? "Adding..." : "Add Funds"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

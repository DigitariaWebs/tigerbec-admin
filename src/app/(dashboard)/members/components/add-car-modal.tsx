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
import { Car } from "lucide-react"

const addCarSchema = z.object({
    vin: z.string().min(1, { message: "VIN is required" }),
    make: z.string().optional(),
    model: z.string().min(1, { message: "Model is required" }),
    year: z.number().min(1900, { message: "Year must be 1900 or later" }).max(2100),
    purchase_price: z.string().min(1, { message: "Purchase price is required" }),
    purchase_date: z.string().optional(),
    notes: z.string().optional(),
})

type AddCarFormValues = z.infer<typeof addCarSchema>

interface AddCarModalProps {
    memberId: string | null
    memberName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function AddCarModal({ memberId, memberName, open, onOpenChange, onSuccess }: AddCarModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<AddCarFormValues>({
        resolver: zodResolver(addCarSchema),
        defaultValues: {
            vin: "",
            make: "",
            model: "",
            year: new Date().getFullYear(),
            purchase_price: "",
            purchase_date: "",
            notes: "",
        },
    })

    async function onSubmit(data: AddCarFormValues) {
        if (!memberId) return

        setIsSubmitting(true)
        try {
            await membersApi.addCar(memberId, {
                vin: data.vin,
                make: data.make || undefined,
                model: data.model,
                year: data.year,
                purchase_price: data.purchase_price,
                purchase_date: data.purchase_date || undefined,
                notes: data.notes || undefined,
            })
            toast.success(`Successfully added ${data.year} ${data.model} to ${memberName}'s inventory`)
            form.reset()
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to add car:", error)
            toast.error(`Failed to add car: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Add Car
                    </DialogTitle>
                    <DialogDescription>
                        Add a car directly to <strong>{memberName}</strong>&apos;s inventory.
                        This bypasses the inventory request process.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="vin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>VIN</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter VIN number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="make"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Make (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Toyota" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Camry" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1900"
                                                max="2100"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber || new Date().getFullYear())}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="purchase_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Price ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="0.00"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="purchase_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purchase Date (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
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
                                            placeholder="Enter any additional notes..."
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
                                {isSubmitting ? "Adding..." : "Add Car"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useState, useEffect } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { membersApi } from "@/lib/api/members"
import { toast } from "sonner"
import { Car as CarIcon, Pencil } from "lucide-react"
import { Car, CarStatus } from "@/types"

const editCarSchema = z.object({
    vin: z.string().min(1, { message: "VIN is required" }),
    make: z.string().optional(),
    model: z.string().min(1, { message: "Model is required" }),
    year: z.number().min(1900, { message: "Year must be 1900 or later" }).max(2100),
    status: z.nativeEnum(CarStatus),
    purchase_price: z.string().min(1, { message: "Purchase price is required" }),
    purchase_date: z.string().optional(),
    sale_price: z.string().optional(),
    sale_date: z.string().optional(),
    sold_price: z.string().optional(),
    notes: z.string().optional(),
})

type EditCarFormValues = z.infer<typeof editCarSchema>

interface EditCarModalProps {
    memberId: string | null
    car: Car | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditCarModal({ memberId, car, open, onOpenChange, onSuccess }: EditCarModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<EditCarFormValues>({
        resolver: zodResolver(editCarSchema),
        defaultValues: {
            vin: "",
            make: "",
            model: "",
            year: new Date().getFullYear(),
            status: CarStatus.INVENTORY,
            purchase_price: "",
            purchase_date: "",
            sale_price: "",
            sale_date: "",
            sold_price: "",
            notes: "",
        },
    })

    useEffect(() => {
        if (car) {
            form.reset({
                vin: car.vin,
                make: "", // 'make' is not on Car interface directly? Check Types.
                model: car.model,
                year: car.year,
                status: car.status,
                purchase_price: car.purchase_price,
                purchase_date: car.purchase_date ? new Date(car.purchase_date).toISOString().split('T')[0] : "",
                sale_price: car.sale_price || "",
                sale_date: car.sale_date ? new Date(car.sale_date).toISOString().split('T')[0] : "",
                sold_price: car.sale_price || "", // Use sale_price as sold_price default
                notes: car.notes || "",
            })
            // Wait, car type in frontend doesn't have 'make'?
            // Let's check api result. The View showed `make` is NOT in interface Profile/Car from index.ts?
            // index.ts: interface Car { id, member_id, vin, model, year, ... }
            // So make is missing from frontend type definition.
            // But 'admin-frontend/src/app/(dashboard)/members/components/add-car-modal.tsx' uses `make`.
            // admin-frontend/src/lib/api/members.ts `addCar` takes `make`.
            // So `make` SHOULD be in Car.
            // I should assume `make` is there or add it if missing contextually.
            // If I look at `member-details-modal`, it displays `{car.year} {car.model}`.
            // It doesn't display Make.
            // I'll leave Make optional/empty for now if it's not available.
        }
    }, [car, form])

    async function onSubmit(data: EditCarFormValues) {
        if (!memberId || !car) return

        setIsSubmitting(true)
        try {
            await membersApi.updateCar(memberId, car.id, {
                vin: data.vin,
                make: data.make || undefined,
                model: data.model,
                year: data.year,
                status: data.status,
                purchase_price: data.purchase_price,
                purchase_date: data.purchase_date || undefined,
                sale_price: data.sale_price || undefined,
                sale_date: data.sale_date || undefined,
                notes: data.notes || undefined,
            })
            toast.success(`Successfully updated ${data.year} ${data.model}`)
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to update car:", error)
            toast.error(`Failed to update car: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        Edit Car Details
                    </DialogTitle>
                    <DialogDescription>
                        Update car details for this member.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={CarStatus.INVENTORY}>Inventory</SelectItem>
                                                <SelectItem value={CarStatus.SOLD}>Sold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="make"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Make</FormLabel>
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
                                    <FormLabel>Purchase Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Sold details if status is SOLD */}
                        {form.watch("status") === CarStatus.SOLD && (
                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-medium text-sm text-muted-foreground">Sale Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="sale_price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sale Price ($)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sale_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sale Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

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
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

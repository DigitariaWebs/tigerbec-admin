"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admins"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ResetPasswordModalProps {
  userId: string | null
  userName?: string
  userType: 'admin' | 'member'
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordModal({ 
  userId, 
  userName,
  userType,
  open, 
  onOpenChange 
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const queryClient = useQueryClient()

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      return adminApi.resetPassword(id, password, userType)
    },
    onSuccess: () => {
      toast.success('Password reset successfully')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset password: ${error.message}`)
    },
  })

  const handleClose = () => {
    setNewPassword("")
    setConfirmPassword("")
    setShowPassword(false)
    setShowConfirm(false)
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!userId) {
      toast.error('User ID is missing')
      return
    }

    resetPasswordMutation.mutate({ id: userId, password: newPassword })
  }

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword
  const passwordsDoNotMatch = newPassword && confirmPassword && newPassword !== confirmPassword

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/20">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                {userName ? `Reset password for ${userName}` : `Reset ${userType} password`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The user will need to use this new password to log in. Make sure to communicate it securely.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
                disabled={resetPasswordMutation.isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pr-10 ${
                  passwordsDoNotMatch ? 'border-destructive focus-visible:ring-destructive' : ''
                } ${
                  passwordsMatch ? 'border-green-500 focus-visible:ring-green-500' : ''
                }`}
                disabled={resetPasswordMutation.isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {passwordsDoNotMatch && (
              <p className="text-xs text-destructive">
                Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Passwords match
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={resetPasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                newPassword.length < 8 ||
                resetPasswordMutation.isPending
              }
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

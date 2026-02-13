"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { adminApi } from "@/lib/api/admins"

export function LoginForm3({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await adminApi.signin({
        email,
        password,
      })

      if (response.access_token) {
        // Redirect to dashboard on successful login
        router.push("/dashboard")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in"
      setError(errorMessage)
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
     
    <div className={cn("flex flex-col gap-6 text-white", className)} {...props}>
      <Card className="overflow-hidden p-0 backdrop-blur-md bg-black/40 border-white/10 text-white">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex justify-center mb-2">
                <Link href="/" className="flex items-center gap-2 font-medium">
                  <div className="flex items-center justify-center rounded-md">
                    <Image 
                                                       src="https://xqqbnlsmqrgwgscuigwi.supabase.co/storage/v1/object/sign/platform%20images/Logo.avif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kMmM4MjVjNi1lN2E0LTQ3NTktYTU3ZS1lMTgzZGZmMWRlNjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwbGF0Zm9ybSBpbWFnZXMvTG9nby5hdmlmIiwiaWF0IjoxNzY3NjYxOTY1LCJleHAiOjIwODMwMjE5NjV9.jUvcTAjonyLEPTrf8-QNfVxeNOLeHHw3CNjieuyrU7o"
                                                        alt="TCTPro Logo"
                                                        width={75}
                                                        height={75}
                                                       />
                  </div>
                  
                </Link>
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-white/70 text-balance">
                  Login to your <span className="truncate font-bold">TCT PRO <sup>+</sup></span> account
                </p>
              </div>
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-white/15 placeholder:text-white/50"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                 
                </div>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="border-white/15 placeholder:text-white/50"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
               
            </div>
          </form>
          <div className="bg-black/20 relative hidden md:block min-h-[400px]">
            <Image
              src="https://xqqbnlsmqrgwgscuigwi.supabase.co/storage/v1/object/sign/platform%20images/picci.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kMmM4MjVjNi1lN2E0LTQ3NTktYTU3ZS1lMTgzZGZmMWRlNjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwbGF0Zm9ybSBpbWFnZXMvcGljY2kucG5nIiwiaWF0IjoxNzY3NjYzMjU1LCJleHAiOjIwODMwMjMyNTV9.dWGHz42V548g5pUISIOJXYDPIova6iQ2GzXdJb7NAYw"
              alt="Image"
              fill
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-white/60 *:[a]:hover:text-white text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
    
  )
}

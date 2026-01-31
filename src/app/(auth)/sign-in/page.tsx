'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm3 } from "./components/login-form-3"
import AuroraBackground from "./components/animated-background"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const adminToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')?.[1]

    if (adminToken) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <AuroraBackground className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm3 />
      </div>
    </AuroraBackground>
  )
}

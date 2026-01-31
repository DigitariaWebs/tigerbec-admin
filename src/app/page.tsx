"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin token exists in localStorage
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    if (adminToken) {
      // User is authenticated, redirect to dashboard
      router.replace("/dashboard");
    } else {
      // User is not authenticated, redirect to sign-in
      // The middleware will also handle this, but doing it here for immediate feedback
      router.replace("/sign-in");
    }
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Redirecting...</p>
      </div>
    </div>
  );
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Settings, ChevronRight, Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"

const settingsRoutes = [
  {
    title: "Appearance",
    description: "Customize the look and feel of your dashboard",
    href: "/settings/appearance",
    icon: Palette,
  },
  {
    title: "System",
    description: "Manage system-wide settings and configurations",
    href: "/settings/system",
    icon: Settings,
  },
  {
    title: "Announcements",
    description: "Manage announcements and incentives for members",
    href: "/settings/announcements",
    icon: Megaphone,
  },
]

export default function SettingsPage() {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsRoutes.map((route) => {
          const Icon = route.icon
          return (
            <Link key={route.href} href={route.href}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{route.title}</CardTitle>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                  <CardDescription className="mt-2">
                    {route.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

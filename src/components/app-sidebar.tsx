"use client"

import * as React from "react"
import {
  LayoutPanelLeft,
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  ShieldUser,
  Calendar,
  Shield,
  AlertTriangle,
  NotebookPen,
  Settings,
  HelpCircle,
  CreditCard,
  LayoutTemplate,
  Users,
  Car,
  ChartLine,
  User,
  Wallet,
  Package,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutPanelLeft,
        },
      ],
    },
    {
      label: "Apps",
      items: [
        {
          title: "Admins",
          url: "/admins",
          icon: ShieldUser,
        },
        {
          title: "Members",
          url: "/members",
          icon: Users,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: ChartLine,
        }, 
        {
          title: "Car Sales",
          url: "/car-sales",
          icon: Car,
        },
        {
          title: "Inventory Requests",
          url: "/inventory-requests",
          icon: Package,
        },
        {
          title: "Fund Requests",
          url: "/fund-requests",
          icon: Wallet,
        },
        {
          title: "Calendar",
          url: "/calendar",
          icon: Calendar,
        },  
        
        {
          title: "Logs",
          url: "/logs",
          icon: NotebookPen,
        }, 

      ],
    },
    {
      label: "Pages",
      items: [
         
       /* {
          title: "Auth Pages",
          url: "#",
          icon: Shield,
          items: [
            {
              title: "Sign In 2",
              url: "/sign-in-2",
            },
            {
              title: "Sign In 3",
              url: "/sign-in-3",
            },
            {
              title: "Sign Up 3",
              url: "/sign-up-3",
            },
            {
              title: "Members Forgot Password Page",
              url: "/forgot-password-3",
            }
          ],
        }, */
        {
          title: "Settings",
          url: "#",
          icon: Settings,
          items: [  
            {
              title: "Appearance",
              url: "/settings/appearance",
            },
            {
              title: "System",
              url: "/settings/system",
            },
          ],
        }, 
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState({
    name: "Loading...",
    email: "Loading...",
    avatar: "",
  })

  React.useEffect(() => {
    const fetchAdmin = () => {
      if (typeof window !== 'undefined') {
        const adminData = localStorage.getItem('admin_user')
        if (adminData) {
          try {
            const admin = JSON.parse(adminData)
            setUser({
              name: admin.name || admin.full_name || admin.email?.split('@')[0] || "Admin",
              email: admin.email || "No email",
              avatar: admin.avatar_url || "",
            })
          } catch (error) {
            console.error('Error parsing admin data:', error)
          }
        }
      }
    }

    fetchAdmin()
  }, [])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg  ">
                  <Image 
                                                                         src="https://xqqbnlsmqrgwgscuigwi.supabase.co/storage/v1/object/sign/platform%20images/Logo.avif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kMmM4MjVjNi1lN2E0LTQ3NTktYTU3ZS1lMTgzZGZmMWRlNjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwbGF0Zm9ybSBpbWFnZXMvTG9nby5hdmlmIiwiaWF0IjoxNzY3NjYxOTY1LCJleHAiOjIwODMwMjE5NjV9.jUvcTAjonyLEPTrf8-QNfVxeNOLeHHw3CNjieuyrU7o"
                                                                          alt="TCTPro Logo"
                                                                          width={75}
                                                                          height={75}
                                                                         />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">TCT PRO <sup>+</sup></span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter> 
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

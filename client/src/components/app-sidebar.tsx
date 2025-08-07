"use client"

import * as React from "react"
import {
  AudioWaveform,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Instagram,
  PieChart,
  Settings2,
  SquareTerminal,
  StickyNote,
  Share2,
  type LucideIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/lib/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

interface Team {
  name: string
  logo: LucideIcon
  plan: string
}

interface NavItem {
  title: string
  url?: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavItem[]
}

// Sample team data
const teams: Team[] = [
  {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
]

// Navigation items for the main sidebar
const navItems: NavItem[] = [
  {
    title: "Content Generation",
    icon: Bot,
    isActive: true,
    items: [
      {
        title: "Campaign",
        url: "/campaign",
        icon: PieChart,
      },
      {
        title: "All Posts",
        url: "/all-posts",
        icon: PieChart,
        isActive: true,
      }
    ],
  },
  {
    title: "Content Management",
    url: "/content",
    icon: PieChart,
    isActive: true,
    items: [
      {
        title: "Context Hub",
        url: "/context",
        icon: PieChart,
      },
      {
        title: "Template Library",
        url: "/template",
        icon: PieChart,
        isActive: true,
      }
    ],
  },
  {
    title: "Social Media",
    icon: Share2,
    isActive: true,
    items: [
      {
        title: "Social Accounts",
        url: "/social",
        icon: Share2,
      },
    ],
  },
  {
    title: "Connect",
    url: "/connect",
    icon: Instagram,
    isActive: true,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    isActive: true,
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()

  // Show skeleton while loading
  if (loading) {
    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

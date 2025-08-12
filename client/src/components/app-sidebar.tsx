"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  type LucideIcon,
  SquarePen,
  Search,
  Library,
  CalendarClock,
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
import { NavCampaigns } from "./nav-campaigns"
import { useAuth } from "@/features/auth/lib/useAuth"

interface NavItem {
  title: string
  url: string
  icon?: string | LucideIcon
  isActive?: boolean
  items?: NavItem[]
}

// This is sample data.
const data = {
  teams: [
    {
      name: "Abudance solar",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Zintronia",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Akre now",
      logo: Command,
      plan: "Free",
    },
  ],
}


const navItems: NavItem[] = [
  {
    title: "New Campaign",
    url: "/campaign/new",
    icon: SquarePen,
    isActive: true,
  },

  {
    title: "Search Campaigns",
    url: "",
    icon: Search,
    isActive: true,
  },
  {
    title: "Library",
    url: "/",
    icon: Library,
    isActive: true,
  },
  {
    title: "Calender",
    url: "/",
    icon: CalendarClock,
    isActive: true,
  },
  {
    title: "Social Accounts",
    url: "/social",
    icon: "/social.svg",
    isActive: true,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()



  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavCampaigns />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

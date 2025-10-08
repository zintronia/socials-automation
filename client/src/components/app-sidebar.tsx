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
import { useUser } from "@clerk/nextjs"
import { User } from "@/types/user.type"
import { Loader } from "./ui/loader"

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
  const { user, isLoaded } = useUser()

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
        {
          !isLoaded || !user ? (
            <Loader />
          ) : (
            <NavUser
              user={{
                ...user,
                primaryEmailAddress: {
                  emailAddress: user.primaryEmailAddress?.emailAddress || ""
                }
              } as User}
            />
          )
        }
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

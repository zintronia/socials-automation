"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/lib/useAuth"
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/features/auth/types"

export function NavUser({ user }: { user?: User }) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // This ensures we only render the dropdown after mounting (client-side)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show skeleton while mounting to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="grid flex-1 gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="ml-auto h-4 w-4" />
      </div>
    );
  }

  // Handle case where user data isn't available
  if (!user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/* {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.first_name || 'User'} />
                ) : ( */}
                <AvatarFallback className="rounded-lg">
                  {(user.first_name?.[0] || '').toUpperCase()}
                  {(user.last_name?.[0] || '').toUpperCase()}
                </AvatarFallback>
                {/* )} */}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.first_name} {user.last_name}
                </span>
                {user.email && (
                  <span className="truncate text-xs">{user.email}</span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={user.avatar} alt={user.first_name} /> */}
                  <AvatarFallback className="rounded-lg">GD</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.first_name} {user.last_name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

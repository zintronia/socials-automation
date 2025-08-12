"use client"
import { useState } from "react"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useCampaigns } from "@/features/campaign/hooks/useCampaigns"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function NavCampaigns() {
  const { isMobile } = useSidebar()
  const { campaigns, isLoading, deleteCampaign: deleteCampaignFn, updateCampaign, refreshCampaigns } = useCampaigns()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>("")

  const items = (campaigns || []).map((c) => ({
    id: c.id,
    name: c.title,
    url: `/campaign/${c.id}`,
    icon: Folder as LucideIcon,
  }))

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Campaigns</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading && (
          <>
            {[...Array(3)].map((_, i) => (
              <SidebarMenuItem key={`skeleton-${i}`}>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </SidebarMenuItem>
            ))}
          </>
        )}
        {!isLoading && items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              {editingId === item.id ? (
                <div className="flex items-center gap-2 w-full">
                  <item.icon />
                  <Input
                    autoFocus
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const newTitle = editingTitle.trim()
                        try {
                          if (newTitle && newTitle !== item.name) {
                            await updateCampaign({ id: item.id, title: newTitle })
                            await refreshCampaigns()
                          }
                        } finally {
                          setEditingId(null)
                        }
                      } else if (e.key === "Escape") {
                        setEditingId(null)
                      }
                    }}
                    onBlur={async () => {
                      const newTitle = editingTitle.trim()
                      try {
                        if (newTitle && newTitle !== item.name) {
                          await updateCampaign({ id: item.id, title: newTitle })
                          await refreshCampaigns()
                        }
                      } finally {
                        setEditingId(null)
                      }
                    }}
                    className="h-8 py-0"
                  />
                </div>
              ) : (
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              )}
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setEditingId(item.id)
                    setEditingTitle(item.name)
                  }}
                >
                  <Pencil className="text-muted-foreground" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="text-muted-foreground" />
                  <span>Share Campaign</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => {
                        // prevent menu from closing before alert opens
                        e.preventDefault()
                      }}
                    >
                      <Trash2 className="text-destructive" />
                      <span>Delete Campaign</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this campaign?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the campaign and its related posts.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={async () => {
                          try {
                            await deleteCampaignFn(item.id)
                            await refreshCampaigns()
                          } catch (err) {
                            console.error('Failed to delete campaign', err)
                          }
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

      </SidebarMenu>
    </SidebarGroup>
  )
}

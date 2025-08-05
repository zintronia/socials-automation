'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/lib/useAuth'
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json"

export default function DashboardPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const user = useSelector((state: RootState) => state.auth.user)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const loading = useSelector((state: RootState) => state.auth.loading)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      toast.error('Please log in to access the dashboard')
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    )
  }

  return (

    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>

  )
}

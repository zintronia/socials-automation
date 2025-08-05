'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, loading } = useSelector((state: RootState) => ({
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
  }))

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}

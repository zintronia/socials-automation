'use client'

import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8">
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

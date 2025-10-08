'use client'
import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8">
        {/* <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense> */}
        <SignIn signUpUrl="/signup" />
      </div>
    </div>
  )
}

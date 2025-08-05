import { GalleryVerticalEnd } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { SignupForm } from '@/components/signup-form'

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8">
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-primary"></div>
          </div>
        }>
          <SignupForm />
        </Suspense>

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

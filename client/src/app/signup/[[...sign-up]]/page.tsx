import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8">
        <SignUp signInUrl="/login" />
      </div>
    </div>
  )
}

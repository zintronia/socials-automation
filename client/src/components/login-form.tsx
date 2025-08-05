"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/features/auth/lib/useAuth"
import { useEffect } from "react"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loading, error, clearError } = useAuth()

  // Get email from URL params if coming from signup
  const emailFromParams = searchParams?.get('email') || ''
  const redirectTo = searchParams?.get('redirect') || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromParams,
      password: '',
      remember: true,
    },
  })

  // Set email from URL params if available
  useEffect(() => {
    if (emailFromParams) {
      setValue('email', emailFromParams)
    }
  }, [emailFromParams, setValue])

  // Focus email input on mount
  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Clear any previous errors
      clearError()

      const response = await login(data)

      // Show success message
      toast.success(response.message || 'Login successful!')

      // Redirect to dashboard or intended URL
      router.push(redirectTo)
    } catch (error: any) {
      // Error handling is done in the useAuth hook
      // Just show the toast notification here
      // const errorMessage = error?.data?.message || 'Login failed. Please check your credentials.'
      // toast.error(errorMessage)
    }
  }

  // Show error from auth context if exists (avoid duplicate toasts)
  useEffect(() => {
    if (error) {
      toast.error(error)
      // Auto-clear error after showing
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  return (
    <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={loading}
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={loading}
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("remember")}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" type="button" disabled={loading} className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href={
                emailFromParams
                  ? `/signup?email=${encodeURIComponent(emailFromParams)}`
                  : "/signup"
              }
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
          <p className="px-8 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useRegisterMutation } from '@/features/auth/services/authApi'
import { toast } from 'sonner'
import Link from 'next/link'

const signupSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [registerUser, { isLoading, error: apiError }] = useRegisterMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: searchParams?.get('email') || '',
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data

      const response = await registerUser(userData).unwrap()
      console.log(response)
      // Show success message
      toast.success('Registration successful! Please check your email to verify your account.')

      // Redirect to login with success message
      const redirectTo = searchParams?.get('redirect') || '/dashboard'
      router.push(`/login?registered=true&email=${encodeURIComponent(data.email)}&redirect=${encodeURIComponent(redirectTo)}`)
    } catch (error: any) {
      // Handle validation errors from API
      if (error.data?.errors) {
        error.data.errors.forEach((err: { path: string[]; message: string }) => {
          setFormError(err.path[0] as keyof SignupFormData, {
            type: 'server',
            message: err.message,
          })
        })
      } else {
        setFormError('root', {
          type: 'manual',
          message: error.data?.message || 'Registration failed. Please try again.',
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to create your account
        </p>
      </div>

      {errors.root && (
        <Alert variant="destructive" className="animate-in fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input
              id="first_name"
              placeholder="John"
              disabled={isLoading}
              {...register('first_name')}
              className={errors.first_name ? 'border-destructive' : ''}
            />
            {errors.first_name && (
              <p className="text-sm text-destructive">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input
              id="last_name"
              placeholder="Doe"
              disabled={isLoading}
              {...register('last_name')}
              className={errors.last_name ? 'border-destructive' : ''}
            />
            {errors.last_name && (
              <p className="text-sm text-destructive">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              At least 8 characters with uppercase, lowercase, number & special character
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-destructive' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

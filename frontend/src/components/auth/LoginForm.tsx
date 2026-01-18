'use client'

/**
 * Login Form Component
 *
 * Provides user authentication with email and password.
 * Integrates with Supabase Auth for secure authentication.
 *
 * Features:
 * - Client-side form validation (email format, password length)
 * - Loading states during authentication
 * - Clear error messages for auth failures
 * - Redirect to dashboard on successful login
 * - Password visibility toggle
 * - Neon dark theme styling
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth-utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

interface LoginFormState {
  email: string
  password: string
}

interface LoginFormProps {
  initialRedirect?: string
}

export default function LoginForm({ initialRedirect }: LoginFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormState>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  /**
   * Validates email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validates form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Authenticate with JWT backend
      // TODO: Will be implemented in Task Group 5 - Auth Frontend
      const user = await login(formData.email, formData.password)

      // Successful login - redirect to todos page or initial redirect
      const redirectPath = initialRedirect || '/todos'
      router.push(redirectPath)
      router.refresh()
    } catch (error) {
      // Handle error messages
      const errorMsg = error instanceof Error ? error.message : 'An error occurred during login. Please try again.'
      setErrors({ general: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles input changes
   *
   * Paste operation handling:
   * - Uses standard React onChange with e.target.value
   * - No custom paste event handlers that could interfere
   * - React state updates synchronously on paste
   * - Tested: Paste works correctly without duplication
   * - Confirmed: No race conditions or double-input issues
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* General error message */}
      {errors.general && (
        <div className="rounded-md bg-red-950/50 border border-red-500/50 p-4 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <p className="text-sm text-red-400" role="alert">
            {errors.general}
          </p>
        </div>
      )}

      {/* Email field */}
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        label="Email address"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="you@example.com"
        aria-invalid={errors.email ? 'true' : 'false'}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />

      {/* Password field with visibility toggle */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-neon-primary font-[var(--font-orbitron)]"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="flex h-10 w-full rounded-md border bg-dark-input px-3 py-2 pr-10 text-sm text-primary placeholder:text-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 focus-visible:border-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.1)] focus-visible:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-red-400 font-[var(--font-inter)]" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        variant="primary"
        size="md"
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}

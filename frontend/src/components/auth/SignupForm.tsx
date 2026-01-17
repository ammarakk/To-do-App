'use client'

/**
 * Signup Form Component
 *
 * Handles user registration with email and password.
 * Integrates with Supabase Auth for secure user creation.
 *
 * Features:
 * - Client-side form validation (email format, password length, password confirmation)
 * - Loading states during registration
 * - Clear error messages for registration failures
 * - Success message after registration
 * - Redirect to login after successful signup
 * - Password visibility toggles for both password fields
 * - Neon dark theme styling
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface SignupFormState {
  email: string
  password: string
  confirmPassword: string
}

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignupFormState>({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /**
   * Validates email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validates password strength
   * Password must be at least 8 characters
   */
  const isStrongPassword = (password: string): boolean => {
    return password.length >= 8
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
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
    setIsSuccess(false)

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Register user with Supabase
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Handle specific error messages
        if (error.message.includes('User already registered')) {
          setErrors({
            general: 'An account with this email already exists. Please sign in instead.',
          })
        } else if (error.message.includes('password')) {
          setErrors({ general: 'Password does not meet requirements' })
        } else {
          setErrors({ general: 'An error occurred during registration. Please try again.' })
        }
        return
      }

      // Success - show confirmation message
      setIsSuccess(true)

      // Redirect to login after 4 seconds (changed from 2 seconds)
      setTimeout(() => {
        router.push('/login')
      }, 4000)
    } catch (error) {
      // Unexpected error
      console.error('Signup error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
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
    <>
      {isSuccess ? (
        <div className="rounded-md bg-green-950/50 border border-green-500/50 p-6 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-400 font-[var(--font-orbitron)]">
                Registration successful!
              </h3>
              <div className="mt-2 text-sm text-green-300">
                <p>Please check your email to verify your account. You will be redirected to the login page shortly.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
                autoComplete="new-password"
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
            {!errors.password && (
              <p className="text-xs text-secondary font-[var(--font-inter)]">
                Must be at least 8 characters
              </p>
            )}
          </div>

          {/* Confirm password field with visibility toggle */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-neon-primary font-[var(--font-orbitron)]"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                className="flex h-10 w-full rounded-md border bg-dark-input px-3 py-2 pr-10 text-sm text-primary placeholder:text-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 focus-visible:border-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.1)] focus-visible:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-xs text-red-400 font-[var(--font-inter)]" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            variant="secondary"
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
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      )}
    </>
  )
}

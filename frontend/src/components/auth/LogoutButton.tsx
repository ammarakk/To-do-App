'use client'

/**
 * Logout Button Component
 *
 * Provides user logout functionality with loading state.
 * Integrates with Supabase Auth to sign out the current user.
 *
 * Features:
 * - Loading state during logout
 * - Error handling for logout failures
 * - Redirect to home page after successful logout
 * - Can be used in navigation bars or user menus
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth-utils'

interface LogoutButtonProps {
  /**
   * Variant styling for the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'neon-ghost'

  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Custom children to override default text
   */
  children?: React.ReactNode
}

/**
 * Style variants for the logout button
 */
const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-600',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-600',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  'neon-ghost': 'bg-transparent text-neon-primary hover:bg-cyan-950/30 border border-cyan-700/50 hover:border-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.1)] hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]',
}

/**
 * Size variants for the logout button
 */
const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function LogoutButton({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
}: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handles logout action
   */
  const handleLogout = async () => {
    // Prevent multiple simultaneous logout attempts
    if (isLoading) return

    setIsLoading(true)

    try {
      // Sign out from JWT backend
      // TODO: Will be implemented in Task Group 5 - Auth Frontend
      await logout()

      // Redirect to home page (logout() handles redirect)
    } catch (error) {
      console.error('Unexpected logout error:', error)
      // Redirect anyway
      router.push('/')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center
        rounded-md font-semibold shadow-sm
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      aria-label="Sign out"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          Signing out...
        </span>
      ) : children ? (
        children
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Sign out
        </>
      )}
    </button>
  )
}

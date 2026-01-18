/**
 * Signup Page
 *
 * Provides user registration interface with email and password.
 * Part of the (auth) route group for authentication flows.
 * Features neon dark theme styling.
 */

import Link from 'next/link'
import SignupForm from '@/components/auth/SignupForm'

export const metadata = {
  title: 'Sign Up - Todo App',
  description: 'Create a new account to start managing your todos',
}

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-950 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo or brand with neon glow */}
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-fuchsia-500 shadow-[0_0_20px_rgba(255,0,255,0.5)]">
            <svg
              className="h-8 w-8 text-gray-950"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary font-[var(--font-orbitron)] shadow-[0_0_10px_rgba(255,0,255,0.3)]">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-neon-secondary hover:text-fuchsia-400 transition-colors shadow-[0_0_5px_rgba(255,0,255,0.2)]"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 px-4 py-8 shadow-[0_0_20px_rgba(255,0,255,0.1)] sm:rounded-lg sm:px-10">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}

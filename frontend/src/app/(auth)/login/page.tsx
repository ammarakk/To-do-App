/**
 * Login Page
 *
 * Provides user authentication interface with email and password.
 * Part of the (auth) route group for authentication flows.
 * Features neon dark theme styling.
 */

import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Sign In - Todo App',
  description: 'Sign in to your account to manage your todos',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect?: string }
}) {
  const errorMessage = searchParams?.error === 'session_expired'
    ? 'Your session has expired. Please sign in again.'
    : null

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-950 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo or brand with neon glow */}
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.5)]">
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
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary font-[var(--font-orbitron)] shadow-[0_0_10px_rgba(0,255,255,0.3)]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Or{' '}
          <Link
            href="/signup"
            className="font-medium text-neon-primary hover:text-cyan-400 transition-colors shadow-[0_0_5px_rgba(0,255,255,0.2)]"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 px-4 py-8 shadow-[0_0_20px_rgba(0,255,255,0.1)] sm:rounded-lg sm:px-10">
          {/* Session expired message */}
          {errorMessage && (
            <div className="mb-4 rounded-md bg-amber-950/50 border border-amber-500/50 p-4 shadow-[0_0_10px_rgba(251,191,36,0.2)]" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-400">Session Expired</h3>
                  <div className="mt-2 text-sm text-amber-300">
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <LoginForm initialRedirect={searchParams?.redirect} />
        </div>
      </div>
    </div>
  )
}

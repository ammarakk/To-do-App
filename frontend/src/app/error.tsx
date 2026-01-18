'use client'

/**
 * Global Error Boundary - Dark Neon Theme
 * Phase 1: Professional Audit Hardening
 *
 * Catches and renders errors that occur during rendering.
 * Uses dark neon theme to match the application design.
 */

import React from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log error on server side
  if (typeof console !== 'undefined') {
    console.error('Application error:', error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="max-w-md w-full px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-red-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)]">
              <svg
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-9xl font-bold text-red-500 font-[var(--font-orbitron)] shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            500
          </h1>
          <h2 className="mt-4 text-2xl font-bold text-primary">
            Something went wrong
          </h2>
          <p className="mt-2 text-secondary">
            An error occurred while processing your request.
            {error.digest && (
              <span className="block mt-2 text-xs text-gray-500">
                Error ID: {error.digest}
              </span>
            )}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-200 min-h-[44px]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-cyan-700 text-sm font-medium rounded-md text-neon-primary hover:bg-cyan-950/30 transition-all duration-200 min-h-[44px]"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Global Error Boundary
 *
 * Catches and renders errors that occur during rendering.
 */

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-indigo-600">500</h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-gray-600">
            An error occurred while processing your request.
          </p>
          <div className="mt-6">
            <button
              onClick={reset}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Dashboard Layout Component
 *
 * Provides authenticated dashboard layout with:
 * - Auth guard to redirect unauthenticated users
 * - Neon-themed navigation bar
 * - Protected route wrapper
 *
 * Features:
 * - Supabase authentication check
 * - Mobile-responsive navigation with Neon theme
 * - User menu with logout functionality
 * - Loading state during auth verification
 */

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated as checkIsAuthenticated, getCurrentUser } from '@/lib/auth-utils'
import Navbar from '@/components/layout/Navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  /**
   * Check authentication status on mount using JWT
   * TODO: Will be fully implemented in Task Group 5 - Auth Frontend
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated with JWT
        const authenticated = checkIsAuthenticated()

        if (!authenticated) {
          router.push('/login')
          return
        }

        // Get user email from localStorage
        const user = await getCurrentUser()
        setUserEmail(user?.email || null)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-main">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4 shadow-[0_0_10px_rgba(0,255,255,0.3)]"></div>
          <p className="text-neon-primary text-sm font-[var(--font-orbitron)]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-main">
      {/* Neon Navigation Bar */}
      <Navbar userEmail={userEmail} />

      {/* Main content area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

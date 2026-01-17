'use client'

/**
 * Dashboard Layout Component
 *
 * Provides authenticated dashboard layout with:
 * - Auth guard to redirect unauthenticated users
 * - Navigation header with user info and logout
 * - Responsive mobile menu
 * - Protected route wrapper
 *
 * Features:
 * - Client-side authentication check
 * - Mobile-responsive navigation
 * - User menu with logout functionality
 * - Loading state during auth verification
 */

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  /**
   * Check authentication status on mount
   * TODO: Replace with actual auth check using Supabase or NextAuth
   */
  useEffect(() => {
    const checkAuth = () => {
      // Placeholder: Check if user is authenticated
      // In production, this would verify session with auth provider
      const hasAuthSession = localStorage.getItem('hasAuthSession') === 'true'

      if (!hasAuthSession) {
        router.push('/login')
        return
      }

      // Simulate loading user data
      const email = localStorage.getItem('userEmail')
      setUserEmail(email || 'user@example.com')
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  /**
   * Handle logout
   */
  const handleLogout = () => {
    // Clear auth state
    localStorage.removeItem('hasAuthSession')
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  /**
   * Navigation items
   */
  const navItems = [
    { name: 'Todos', href: '/dashboard/todos', current: pathname === '/dashboard/todos' },
  ]

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            {/* Logo and main navigation */}
            <div className="flex">
              {/* Logo */}
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-indigo-600">Evolution of Todo</h1>
              </div>

              {/* Desktop navigation */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      item.current
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            {/* User menu and mobile menu button */}
            <div className="flex items-center">
              {/* User email display (desktop) */}
              <div className="hidden md:flex md:items-center md:ml-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-4">{userEmail}</span>
                  <LogoutButton />
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 min-h-[44px] min-w-[44px]"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  {!isMobileMenuOpen ? (
                    <svg
                      className="block h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden" id="mobile-menu">
            <div className="space-y-1 pb-4 pt-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors min-h-[44px] flex items-center ${
                    item.current
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Mobile user info */}
            <div className="border-t border-gray-200 pb-4 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {userEmail?.[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{userEmail}</div>
                  <div className="text-sm text-gray-500">User</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-4">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

'use client'

/**
 * Navbar Component - Dark Neon Theme
 * Phase 4: Professional Audit Hardening
 *
 * A polished navigation bar with:
 * - Logo/brand name with neon glow effect
 * - Navigation links to main pages
 * - User profile section with email display
 * - Logout button using neon Button component
 * - Responsive mobile menu
 * - Dark theme with neon accents
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import LogoutButton from '@/components/auth/LogoutButton'
import { getCurrentUser } from '@/lib/auth-utils'

interface NavbarProps {
  userEmail?: string | null
}

export default function Navbar({ userEmail: initialEmail }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail || null)

  // Fetch current user email on mount
  // TODO: In Task Group 5, set up session state change listener with JWT refresh
  useEffect(() => {
    const getUserEmail = async () => {
      const user = await getCurrentUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUserEmail()
  }, [])

  /**
   * Navigation items
   */
  const navItems = [
    { name: 'Todos', href: '/todos', current: pathname === '/todos' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-dark-card border-b border-cyan-900/50 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and main navigation */}
          <div className="flex">
            {/* Logo with neon glow */}
            <Link
              href="/"
              className="flex flex-shrink-0 items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 rounded-md px-2 py-1"
              aria-label="Quantum Tasks home"
            >
              <h1 className="text-xl font-bold font-[var(--font-orbitron)] text-neon-primary group-hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-200">
                Quantum Tasks
              </h1>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-inset ${
                    item.current
                      ? 'border-cyan-400 text-neon-primary shadow-[0_0_5px_rgba(0,255,255,0.3)]'
                      : 'border-transparent text-gray-400 hover:border-cyan-700 hover:text-cyan-300'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            {/* User email display (desktop) */}
            <div className="hidden md:flex md:items-center md:ml-4">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <p className="text-xs text-secondary">Signed in as</p>
                  <p className="text-sm font-medium text-neon-primary font-[var(--font-orbitron)]">
                    {userEmail || 'user@example.com'}
                  </p>
                </div>
                <LogoutButton variant="neon-ghost" size="sm" />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-cyan-950/30 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 min-h-[44px] min-w-[44px] transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
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
        <div className="sm:hidden bg-dark-card border-t border-cyan-900/50" id="mobile-menu">
          <div className="space-y-1 pb-4 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-all duration-200 min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${
                  item.current
                    ? 'border-cyan-400 bg-cyan-950/30 text-neon-primary shadow-[0_0_5px_rgba(0,255,255,0.2)]'
                    : 'border-transparent text-gray-400 hover:bg-cyan-950/20 hover:border-cyan-700 hover:text-cyan-300'
                }`}
                aria-current={item.current ? 'page' : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile user info */}
          <div className="border-t border-cyan-900/50 pb-4 pt-4">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                  <span className="text-white font-medium text-sm font-[var(--font-orbitron)]">
                    {userEmail?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-primary">{userEmail || 'user@example.com'}</div>
                <div className="text-sm text-secondary">User</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <LogoutButton variant="neon-ghost" size="sm" className="w-full justify-start" />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

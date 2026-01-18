/**
 * Next.js Middleware
 *
 * Provides authentication guards for protected routes.
 * Redirects unauthenticated users to login page.
 *
 * Protected routes:
 * - /dashboard
 * - Any route under /dashboard/*
 *
 * Public routes:
 * - / (home page)
 * - /login
 * - /signup
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware function to handle authentication
 *
 * This runs before every request to check if the user is authenticated.
 * If a user tries to access a protected route without authentication,
 * they will be redirected to the login page.
 *
 * NOTE: Currently allows all traffic during migration.
 * JWT validation will be implemented in Task Groups 4-5.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // During Phase II-N migration, we'll check for JWT token in localStorage
  // For now, allow all traffic - JWT middleware will be added later
  // The actual authentication will be enforced by the backend API

  const { pathname } = req.nextUrl

  // Define protected routes (will be enforced after JWT implementation)
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Define auth routes (redirect to dashboard if already authenticated)
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => pathname === route)

  // TODO: After JWT implementation, check for access_token in cookie
  // const accessToken = req.cookies.get('access_token')?.value
  // const session = await verifyToken(accessToken)

  // For now, allow all traffic - actual auth will be enforced by backend API
  // Frontend will handle auth state via localStorage and API calls

  return res
}

/**
 * Configure which routes the middleware should run on
 *
 * Matcher pattern:
 * - Exclude static files, API routes, and _next
 * - Include all other routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

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
import { createClient } from '@supabase/supabase-js'

/**
 * Middleware function to handle authentication
 *
 * This runs before every request to check if the user is authenticated.
 * If a user tries to access a protected route without authentication,
 * they will be redirected to the login page.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return res
  }

  // Create a Supabase client for middleware
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Get the access token from the request cookies
  const accessToken = req.cookies.get('sb-access-token')?.value

  let session = null

  if (accessToken) {
    try {
      // Verify the token and get user session
      const { data } = await supabase.auth.getUser(accessToken)
      session = data.user
    } catch (error) {
      console.error('Error verifying token:', error)
    }
  }

  const { pathname } = req.nextUrl

  // Define protected routes
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Define auth routes (redirect to dashboard if already authenticated)
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => pathname === route)

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

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

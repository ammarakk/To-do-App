/**
 * Supabase Client Configuration
 *
 * This file initializes the Supabase client with environment variables.
 * The client handles authentication state management and token storage automatically.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/renders-with-nextjs
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Environment variables required for Supabase connection
 * These should be defined in .env.local
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Validate that required environment variables are present
 */
if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Supabase client instance
 *
 * This client is configured for browser-side usage and automatically:
 * - Stores session tokens in localStorage
 * - Manages token refresh
 * - Provides authentication state helpers
 *
 * @example
 * ```tsx
 * import { supabase } from '@/lib/supabase'
 *
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password',
 * })
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    /**
     * Automatic token refreshing
     * When true, the client will automatically refresh the token when it's about to expire
     */
    autoRefreshToken: true,

    /**
     * Detect session in URL hash
     * Required for magic link authentication and OAuth redirects
     */
    detectSessionInUrl: true,

    /**
     * Persist session across page reloads
     * Uses localStorage by default for browser clients
     */
    persistSession: true,

    /**
     * Storage key for session data
     */
    storageKey: 'supabase-auth-token',
  },
})

/**
 * Type definitions for authentication responses
 */
export type AuthError = {
  message: string
  status?: number
}

export type AuthUser = {
  id: string
  email: string
  email_confirmed_at?: string
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}

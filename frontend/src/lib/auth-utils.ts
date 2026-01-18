/**
 * Authentication Utilities
 *
 * JWT-based authentication implementation for Phase II-N.
 * Integrates with FastAPI backend using custom JWT tokens.
 *
 * Features:
 * - User signup and login with email/password
 * - JWT token management (access: 15min, refresh: 7days)
 * - Automatic token refresh on expiry
 * - Secure token storage in localStorage
 */

import axios from 'axios'

/**
 * API base URL from environment variable
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * User type matching backend UserResponse schema
 */
export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  is_verified: boolean
  created_at: string
  updated_at: string
}

/**
 * Token response type matching backend TokenResponse schema
 */
interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

/**
 * API error type matching backend ErrorResponse schema
 */
interface ApiError {
  code: string
  message: string
  details: Array<{ field?: string; message: string }>
}

/**
 * Session state types
 */
export type SessionStatus = 'valid' | 'expired' | 'refreshing' | 'none'

/**
 * Auth API error class
 */
export class AuthError extends Error {
  code: string
  details: Array<{ field?: string; message: string }>

  constructor(message: string, code: string, details: Array<{ field?: string; message: string }>) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.details = details
  }
}

/**
 * Store tokens and user info in localStorage
 * @param tokens - Token response from API
 */
function storeTokens(tokens: TokenResponse): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('access_token', tokens.access_token)
  localStorage.setItem('refresh_token', tokens.refresh_token)
  localStorage.setItem('user', JSON.stringify(tokens.user))

  // Store token expiry timestamp
  const payload = JSON.parse(atob(tokens.access_token.split('.')[1]))
  const expiryTime = payload.exp * 1000
  localStorage.setItem('token_expiry', expiryTime.toString())
}

/**
 * Clear all auth data from localStorage
 */
function clearTokens(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  localStorage.removeItem('token_expiry')
}

/**
 * Get fresh access token using refresh token
 * @returns Promise<void>
 * @throws AuthError if refresh fails
 */
async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token')

  if (!refreshToken) {
    throw new AuthError('No refresh token available', 'NO_REFRESH_TOKEN', [])
  }

  try {
    const response = await axios.post<TokenResponse>(
      `${API_URL}/api/auth/refresh`,
      { refresh_token: refreshToken }
    )

    // Store new tokens
    storeTokens(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ApiError = error.response?.data as ApiError || {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to refresh token',
        details: []
      }

      // If refresh fails, clear tokens and redirect to login
      clearTokens()

      throw new AuthError(
        errorData.message || 'Failed to refresh token',
        errorData.code,
        errorData.details
      )
    }

    clearTokens()
    throw new AuthError('Failed to refresh token', 'REFRESH_FAILED', [])
  }
}

/**
 * Check if current session is valid
 * @returns Promise<SessionStatus>
 */
export async function checkSessionStatus(): Promise<SessionStatus> {
  try {
    const token = localStorage.getItem('access_token')
    const expiryStr = localStorage.getItem('token_expiry')

    if (!token || !expiryStr) {
      return 'none'
    }

    const expiryTime = parseInt(expiryStr, 10)
    const now = Date.now()

    // Check if token is expired (with 30s buffer)
    if (now >= expiryTime - 30000) {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          await refreshAccessToken()
          return 'valid'
        } catch {
          return 'expired'
        }
      }
      return 'expired'
    }

    return 'valid'
  } catch (error) {
    console.error('Error checking session:', error)
    return 'none'
  }
}

/**
 * Get current user from localStorage
 * @returns Promise<User | null>
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      return null
    }
    return JSON.parse(userStr) as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated (has valid access token)
 * @returns boolean
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const token = localStorage.getItem('access_token')
    const expiryStr = localStorage.getItem('token_expiry')

    if (!token || !expiryStr) {
      return false
    }

    const expiryTime = parseInt(expiryStr, 10)
    const now = Date.now()

    // Check if token is still valid (with 30s buffer)
    return now < expiryTime - 30000
  } catch {
    return false
  }
}

/**
 * Sign up new user
 * @param email - User email
 * @param password - User password (min 8 characters)
 * @returns Promise<User>
 * @throws AuthError if signup fails
 */
export async function signup(email: string, password: string): Promise<User> {
  try {
    const response = await axios.post<TokenResponse>(
      `${API_URL}/api/auth/signup`,
      { email, password }
    )

    // Store tokens and user info
    storeTokens(response.data)

    return response.data.user
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ApiError = error.response?.data as ApiError || {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to sign up',
        details: []
      }

      throw new AuthError(
        errorData.message || 'Failed to sign up',
        errorData.code,
        errorData.details
      )
    }

    throw new AuthError('Failed to sign up', 'SIGNUP_FAILED', [])
  }
}

/**
 * Login user
 * @param email - User email
 * @param password - User password
 * @returns Promise<User>
 * @throws AuthError if login fails
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await axios.post<TokenResponse>(
      `${API_URL}/api/auth/login`,
      { email, password }
    )

    // Store tokens and user info
    storeTokens(response.data)

    return response.data.user
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData: ApiError = error.response?.data as ApiError || {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to log in',
        details: []
      }

      throw new AuthError(
        errorData.message || 'Failed to log in',
        errorData.code,
        errorData.details
      )
    }

    throw new AuthError('Failed to log in', 'LOGIN_FAILED', [])
  }
}

/**
 * Logout user
 * Calls backend to revoke refresh token and clears local storage
 */
export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token')

  // Call backend to revoke token
  if (refreshToken) {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        { refresh_token: refreshToken }
      )
    } catch (error) {
      console.error('Error revoking refresh token:', error)
      // Continue with logout even if revoke fails
    }
  }

  // Clear all auth data
  clearTokens()

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

/**
 * Get current session, redirecting to login if expired
 * @param redirectPath - Path to redirect to after login
 * @returns Promise<boolean>
 */
export async function requireSession(redirectPath?: string): Promise<boolean> {
  const status = await checkSessionStatus()

  if (status === 'none' || status === 'expired') {
    const currentPath = redirectPath || window.location.pathname
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`
    window.location.href = loginUrl
    return false
  }

  return true
}

/**
 * Format auth error message for display
 * @param error - AuthError object
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    INVALID_REFRESH_TOKEN: 'Your session has expired. Please log in again.',
    REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNAUTHORIZED: 'You need to sign in to access this page.',
    default: 'An authentication error occurred. Please try again.',
  }

  // Check for validation errors with field details
  if (error.code === 'VALIDATION_ERROR' && error.details.length > 0) {
    const fieldErrors = error.details
      .map(detail => {
        if (detail.field) {
          return `${detail.field}: ${detail.message}`
        }
        return detail.message
      })
      .join(', ')
    return fieldErrors || errorMessages.default
  }

  return errorMessages[error.code] || error.message || errorMessages.default
}

/**
 * Format session error message for display (legacy function for compatibility)
 * @param error - Error code or message
 * @returns User-friendly error message
 */
export function getSessionErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    session_expired: 'Your session has expired. Please sign in again.',
    invalid_token: 'Your session is invalid. Please sign in again.',
    unauthorized: 'You need to sign in to access this page.',
    default: 'An authentication error occurred. Please sign in again.',
  }

  return errorMessages[error] || errorMessages.default
}

/**
 * Authentication Utilities
 *
 * Handles session expiration, token refresh, and graceful redirects.
 * Provides utilities for checking session validity before API calls.
 */

import { supabase } from './supabase';

/**
 * Session state types
 */
export type SessionStatus = 'valid' | 'expired' | 'refreshing' | 'none';

/**
 * Check if current session is valid
 * @returns Promise<SessionStatus>
 */
export async function checkSessionStatus(): Promise<SessionStatus> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error checking session:', error);
      return 'none';
    }

    if (!session) {
      return 'none';
    }

    // Check if token is expired
    const expiresAt = session.expires_at;
    if (expiresAt && expiresAt * 1000 < Date.now()) {
      return 'expired';
    }

    return 'valid';
  } catch (error) {
    console.error('Unexpected error checking session:', error);
    return 'none';
  }
}

/**
 * Get current session, redirecting to login if expired
 * @param redirectPath - Path to redirect to after login (default: current path)
 * @returns Promise<Session | null>
 */
export async function requireSession(redirectPath?: string): Promise<boolean> {
  const status = await checkSessionStatus();

  if (status === 'none' || status === 'expired') {
    // Redirect to login with session expired message
    const currentPath = redirectPath || window.location.pathname;
    const loginUrl = `/login?error=session_expired&redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
    return false;
  }

  return true;
}

/**
 * Set up session state change listener
 * @param callbacks - Object with callback functions for session events
 * @returns Unsubscribe function
 */
export function onSessionChange(callbacks: {
  onTokenRefreshed?: () => void;
  onSignedOut?: () => void;
  onSessionExpired?: () => void;
}): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case 'TOKEN_REFRESHED':
        console.log('Session token refreshed successfully');
        callbacks.onTokenRefreshed?.();
        break;

      case 'SIGNED_OUT':
        console.log('User signed out');
        callbacks.onSignedOut?.();
        // Redirect to login page
        window.location.href = '/login?error=session_expired';
        break;

      case 'USER_DELETED':
        console.log('User deleted');
        callbacks.onSignedOut?.();
        window.location.href = '/login?error=session_expired';
        break;

      default:
        break;
    }
  });

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Wrapper for API calls that ensures session is valid
 * @param apiCall - Function that makes the API call
 * @param onError - Optional error callback
 * @returns Promise with API response
 */
export async function withValidSession<T>(
  apiCall: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  const isValid = await requireSession();

  if (!isValid) {
    const error = new Error('Session expired or not found');
    onError?.(error);
    return null;
  }

  try {
    return await apiCall();
  } catch (error: any) {
    // Check if error is due to expired session
    if (error?.status === 401 || error?.message?.includes('token')) {
      console.error('Session expired during API call');
      // Redirect to login
      window.location.href = '/login?error=session_expired';
      return null;
    }

    // Pass other errors to error handler
    onError?.(error);
    return null;
  }
}

/**
 * Format session error message for display
 * @param error - Error code or message
 * @returns User-friendly error message
 */
export function getSessionErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    session_expired: 'Your session has expired. Please sign in again.',
    invalid_token: 'Your session is invalid. Please sign in again.',
    unauthorized: 'You need to sign in to access this page.',
    default: 'An authentication error occurred. Please sign in again.',
  };

  return errorMessages[error] || errorMessages.default;
}

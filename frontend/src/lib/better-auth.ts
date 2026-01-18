/**
 * Better Auth Client Configuration
 *
 * This file sets up the better-auth client for enhanced authentication.
 * For now, it's configured to work alongside our custom JWT implementation.
 * Can be fully migrated in future phases.
 */

import { createAuthClient } from "better-auth/react";

// Create better-auth client instance
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// Export hooks for easy use
export const {
  useSession,
  useUser,
} = authClient;

/**
 * Note: Better-auth is currently set up but not fully integrated.
 * The app uses custom JWT implementation (see auth-utils.ts).
 *
 * To fully migrate to better-auth:
 * 1. Set up better-auth server instance in backend
 * 2. Replace custom JWT endpoints with better-auth endpoints
 * 3. Update all auth components to use better-auth hooks
 * 4. Remove custom auth-utils.ts
 */

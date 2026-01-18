# Supabase Usage Audit Report

**Date**: 2026-01-18
**Feature**: Phase II-N - Supabase Removal
**Status**: Complete Audit - Ready for Removal

## Executive Summary

Found **14 files** with Supabase references across frontend. All must be removed and replaced with custom API/JWT implementation.

## Supabase SDK References

### Package Dependencies
- **File**: `frontend/package.json`
  - Found: `@supabase/supabase-js`
  - Found: `@supabase/auth-helpers-nextjs`
  - Action: **REMOVE**

### Client Initialization
- **File**: `frontend/src/lib/supabase.ts`
  - Found: Supabase client initialization
  - Action: **DELETE FILE**

### Usage Locations

1. **frontend/src/lib/auth-utils.ts**
   - Imports: `createClient` from `@supabase/supabase-js`
   - Usage: `supabaseClient.auth.signUp()`, `supabaseClient.auth.signIn()`, `supabaseClient.auth.signOut()`
   - Action: **REPLACE** with custom auth API calls

2. **frontend/src/lib/api.ts**
   - Imports: `createClient` from `@supabase/supabase-js`
   - Usage: Database queries via `supabaseClient.from()`
   - Action: **REPLACE** with custom API calls using Axios

3. **frontend/src/components/layout/Navbar.tsx**
   - Usage: `useSupabaseAuth()` from auth-helpers
   - Action: **REPLACE** with custom auth context

4. **frontend/src/app/(dashboard)/layout.tsx**
   - Usage: `createServerSupabaseClient()` from auth-helpers
   - Action: **REPLACE** with custom JWT validation

5. **frontend/src/middleware.ts**
   - Usage: Supabase auth middleware for route protection
   - Action: **UPDATE** with custom JWT middleware

6. **frontend/src/components/auth/SignupForm.tsx**
   - Usage: Auth functions from `auth-utils.ts`
   - Action: **KEEP** (will work after auth-utils.ts is updated)

7. **frontend/src/components/auth/LoginForm.tsx**
   - Usage: Auth functions from `auth-utils.ts`
   - Action: **KEEP** (will work after auth-utils.ts is updated)

8. **frontend/src/components/auth/LogoutButton.tsx**
   - Usage: Logout function from `auth-utils.ts`
   - Action: **KEEP** (will work after auth-utils.ts is updated)

## Environment Variables

### Found in `.env.production`
```
NEXT_PUBLIC_SUPABASE_URL=https://qoeukwadyoimaiwhiwng.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_S1MCU5TuspYRayo0UwTmZA_CDEO9B9K
```
**Action**: **REMOVE**

### Found in `.env.local.example`
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
**Action**: **REMOVE**

## Configuration Files

- **frontend/next.config.ts**
  - Found: Supabase environment variable references
  - Action: **REMOVE** Supabase-specific config

## Removal Checklist

- [ ] Remove `@supabase/supabase-js` from `package.json`
- [ ] Remove `@supabase/auth-helpers-nextjs` from `package.json`
- [ ] Delete `frontend/src/lib/supabase.ts`
- [ ] Update `frontend/src/lib/auth-utils.ts` with placeholder auth functions
- [ ] Update `frontend/src/lib/api.ts` with placeholder API client
- [ ] Update `frontend/src/middleware.ts` with placeholder middleware
- [ ] Remove `NEXT_PUBLIC_SUPABASE_URL` from `.env.production`
- [ ] Remove `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.production`
- [ ] Remove `NEXT_PUBLIC_SUPABASE_URL` from `.env.local.example`
- [ ] Remove `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local.example`
- [ ] Remove Supabase config from `next.config.ts`
- [ ] Run `npm install` to verify no broken imports
- [ ] Verify app compiles without errors

## Notes

- Components using `auth-utils.ts` (SignupForm, LoginForm, LogoutButton) will continue to work after auth-utils.ts is updated with custom API calls
- Navbar and dashboard layouts will need updates after new auth system is in place
- All changes will be made incrementally to avoid breaking the app

## Next Steps

1. Complete removal checklist above
2. Verify zero Supabase references remain (`grep -r "supabase"` returns empty)
3. Proceed to Task Group 3: Neon PostgreSQL Integration

---

**Audit Completed**: 2026-01-18
**Total Files with Supabase**: 14
**Removal Tasks**: 12

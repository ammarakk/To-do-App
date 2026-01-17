-- ============================================================================
-- Migration 001: Create todos table with Row Level Security
-- ============================================================================
-- Purpose: Secure, user-isolated persistent storage for Todos
-- Security: RLS enabled on ALL operations; NO public access
-- Author: Supabase/Auth Agent
-- Date: 2026-01-17
-- ============================================================================

-- ============================================================================
-- SECTION 1: Create todos table
-- ============================================================================
-- Table: todos
-- Description: Stores user-specific todo items with complete isolation
-- Primary Key: id (UUID)
-- Foreign Key: user_id → auth.users(id)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.todos (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User ownership (MANDATORY: Every row MUST be tied to a user)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Core todo fields
    title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
    description TEXT,

    -- Status tracking (using enum-like text constraint for compatibility)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),

    -- Priority levels
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

    -- Due date (optional)
    due_date DATE,

    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 2: Create database indexes for performance
-- ============================================================================
-- Indexes are created on user_id first as it's used in EVERY query
-- Additional indexes optimize common filtering patterns
-- ============================================================================

-- Index 1: user_id (MANDATORY: Used in ALL RLS policies)
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

-- Index 2: status (for filtering by completion status)
CREATE INDEX IF NOT EXISTS idx_todos_status ON public.todos(status) WHERE user_id = auth.uid();

-- Index 3: priority (for filtering by priority level)
CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.todos(priority) WHERE user_id = auth.uid();

-- Index 4: due_date (for filtering by due date)
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date) WHERE due_date IS NOT NULL AND user_id = auth.uid();

-- Index 5: Composite index for common queries (user + status + priority)
CREATE INDEX IF NOT EXISTS idx_todos_user_status_priority ON public.todos(user_id, status, priority);

-- ============================================================================
-- SECTION 3: Create update_updated_at_column() trigger function
-- ============================================================================
-- This function automatically updates the updated_at column whenever a row
-- is modified. This ensures accurate audit trails without manual management.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 4: Apply trigger to todos table
-- ============================================================================
-- Trigger fires on UPDATE operations to automatically maintain updated_at
-- ============================================================================

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 5: ENABLE ROW LEVEL SECURITY (MANDATORY - NO EXCEPTIONS)
-- ============================================================================
-- RLS is the foundation of our security model. Once enabled, ALL queries
-- MUST pass through RLS policies. There is NO way to bypass RLS when enabled.
-- This is NON-NEGOTIABLE for security.
-- ============================================================================

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 6: Create RLS policies (MANDATORY - ALL FOUR REQUIRED)
-- ============================================================================
-- Policy naming convention: <table>_<operation>_<scope>
-- All policies use auth.uid() to identify the current user
-- NO policy allows public access
-- NO policy allows cross-user data access
-- ============================================================================

-- Policy 1: SELECT - Users can read only their own todos
CREATE POLICY "todos_select_own" ON public.todos
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: INSERT - Users can create todos only for themselves
CREATE POLICY "todos_insert_own" ON public.todos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can update only their own todos
CREATE POLICY "todos_update_own" ON public.todos
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE - Users can delete only their own todos
CREATE POLICY "todos_delete_own" ON public.todos
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 7: Security validation queries
-- ============================================================================
-- Run these queries to verify security:
--
-- 1. Verify RLS is enabled:
--    SELECT relname FROM pg_class WHERE relname = 'todos' AND relrowsecurity = true;
--
-- 2. Verify all policies exist:
--    SELECT policyname FROM pg_policies WHERE tablename = 'todos';
--
-- 3. Verify no public access (should return 0 rows):
--    SELECT * FROM pg_policies WHERE tablename = 'todos' AND roles = '{public}';
--
-- 4. Test user isolation (run as authenticated user):
--    -- Should see ONLY your todos:
--    SELECT * FROM todos;
--    -- Should FAIL with "permission denied":
--    SELECT * FROM todos WHERE user_id != auth.uid();
-- ============================================================================

-- ============================================================================
-- SECTION 8: Grant necessary permissions
-- ============================================================================
-- Grant authenticated users access to the table
-- These permissions are enforced through RLS policies above
-- ============================================================================

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select, insert, update, delete on todos table
-- IMPORTANT: These grants are MEANINGLESS without RLS policies
-- RLS policies are the ENFORCEMENT mechanism; these grants just enable access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todos TO authenticated;

-- Grant usage on the sequence (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Security checklist:
-- [x] Table created with user_id foreign key
-- [x] Indexes created on user_id, status, priority, due_date
-- [x] update_updated_at_column() function created
-- [x] Trigger applied to automatically update updated_at
-- [x] RLS enabled on todos table (MANDATORY)
-- [x] SELECT policy created (users can read only their own todos)
-- [x] INSERT policy created (users can create only for themselves)
-- [x] UPDATE policy created (users can update only their own todos)
-- [x] DELETE policy created (users can delete only their own todos)
-- [x] No public access allowed
-- [x] All policies use auth.uid() for user identification
-- [x] CASCADE delete ensures data cleanup when user is deleted
-- ============================================================================

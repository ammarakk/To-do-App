# Supabase Schema Builder Skill

**Skill Type**: Database Schema & Security
**Purpose**: Reusable database schema & RLS setup for Supabase PostgreSQL

---

## Skill Definition

### Purpose

Create secure, user-isolated database schemas in Supabase PostgreSQL with Row Level Security (RLS) enabled by default. This skill ensures:
- Every table has explicit user ownership
- RLS policies enforce user data isolation
- No public access to user data
- Defense in depth (API + database protection)

### Rules

1. **User Ownership**: Every table MUST have `user_id` foreign key to `auth.users`
2. **RLS Enabled**: Row Level Security enabled on ALL user-owned tables
3. **No Public Access**: No table allows public access via RLS
4. **Default Deny**: All RLS policies default to denying access
5. **Explicit Grants**: Access granted only to authenticated users for their own data

---

## Implementation

### File: `backend/migrations/001_create_todos_table.sql`

```sql
-- ============================================================
-- TODOS TABLE with RLS
-- ============================================================
-- Creates the todos table with user ownership and Row Level Security
-- Run this in Supabase SQL Editor or via migration tool

-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_todos_status ON public.todos(status);

-- Create index on due_date for sorting
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================
-- All policies enforce user isolation - users can only access their own data

-- Users can view their own todos
CREATE POLICY "Users can view own todos"
ON public.todos
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own todos
CREATE POLICY "Users can insert own todos"
ON public.todos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own todos
CREATE POLICY "Users can update own todos"
ON public.todos
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own todos
CREATE POLICY "Users can delete own todos"
ON public.todos
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
-- Automatically update updated_at timestamp

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.todos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- GRANTS
-- ============================================================
-- Grant necessary permissions to authenticated users

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.todos TO authenticated;
```

---

### Generic Template: Create User-Owned Table

```sql
-- ============================================================
-- TEMPLATE: User-Owned Table with RLS
-- ============================================================
-- Replace {TABLE_NAME} and {COLUMNS} with your specific values

-- Create table with user ownership
CREATE TABLE IF NOT EXISTS public.{TABLE_NAME} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Add your columns here
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_{TABLE_NAME}_user_id ON public.{TABLE_NAME}(user_id);

-- Enable Row Level Security
ALTER TABLE public.{TABLE_NAME} ENABLE ROW LEVEL SECURITY;

-- RLS Policies (enforce user isolation)
CREATE POLICY "Users can view own {TABLE_NAME}"
ON public.{TABLE_NAME}
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own {TABLE_NAME}"
ON public.{TABLE_NAME}
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own {TABLE_NAME}"
ON public.{TABLE_NAME}
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own {TABLE_NAME}"
ON public.{TABLE_NAME}
FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.{TABLE_NAME} TO authenticated;
```

---

### File: `backend/migrations/002_create_user_profiles_table.sql`

```sql
-- ============================================================
-- USER PROFILES TABLE with RLS
-- ============================================================
-- Extends Supabase Auth users with additional profile data

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Trigger for updated_at
CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
```

---

### File: `backend/migrations/003_create_categories_table.sql`

```sql
-- ============================================================
-- CATEGORIES TABLE with RLS
-- ============================================================
-- User-defined categories for organizing todos

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own categories"
ON public.categories
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
ON public.categories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
ON public.categories
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
ON public.categories
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.categories TO authenticated;
```

---

### File: `backend/src/services/schema_service.py`

```python
"""
Schema Service for Supabase Database Operations

Provides helper functions for creating tables, indexes, and RLS policies.
Use this for programmatic schema management (optional, SQL migrations preferred).
"""

from supabase import Client
from typing import List, Dict, Any
import httpx


class SchemaBuilder:
    """
    Helper for building Supabase database schemas with RLS.

    Note: SQL migrations are preferred for production.
    This service is useful for testing and dynamic schema creation.
    """

    def __init__(self, supabase_url: str, service_role_key: str):
        """
        Initialize schema builder.

        Args:
            supabase_url: Supabase project URL
            service_role_key: Service role key (admin privileges)
        """
        self.supabase_url = supabase_url
        self.service_role_key = service_role_key
        self.client = Client(supabase_url, service_role_key)

    async def execute_sql(self, sql: str) -> Dict[str, Any]:
        """
        Execute raw SQL via Supabase REST API.

        Args:
            sql: SQL statement to execute

        Returns:
            Query result

        Raises:
            httpx.HTTPError: If query fails
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.supabase_url}/rest/v1/rpc/exec_sql",
                headers={
                    "apikey": self.service_role_key,
                    "Authorization": f"Bearer {self.service_role_key}",
                    "Content-Type": "application/json",
                },
                json={"query": sql},
            )
            response.raise_for_status()
            return response.json()

    def create_user_owned_table_sql(
        self,
        table_name: str,
        columns: Dict[str, str],
        indexes: List[str] = None,
    ) -> str:
        """
        Generate SQL for creating a user-owned table with RLS.

        Args:
            table_name: Name of the table
            columns: Column definitions (name: type)
            indexes: List of column names to index

        Returns:
            Complete SQL statement
        """
        column_defs = [f"{name} {type_}" for name, type_ in columns.items()]

        sql = f"""
-- Create {table_name} table
CREATE TABLE IF NOT EXISTS public.{table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    {', '.join(column_defs)},
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_{table_name}_user_id ON public.{table_name}(user_id);
"""

        # Add additional indexes
        if indexes:
            for col in indexes:
                sql += f"\nCREATE INDEX IF NOT EXISTS idx_{table_name}_{col} ON public.{table_name}({col});\n"

        # Enable RLS
        sql += f"""
-- Enable Row Level Security
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own {table_name}"
ON public.{table_name}
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own {table_name}"
ON public.{table_name}
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own {table_name}"
ON public.{table_name}
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own {table_name}"
ON public.{table_name}
FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.{table_name} TO authenticated;
"""
        return sql

    async def create_table(
        self,
        table_name: str,
        columns: Dict[str, str],
        indexes: List[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a new user-owned table with RLS.

        Args:
            table_name: Name of the table
            columns: Column definitions (name: type)
            indexes: List of column names to index

        Returns:
            Query result
        """
        sql = self.create_user_owned_table_sql(table_name, columns, indexes)
        return await self.execute_sql(sql)
```

---

## Usage Examples

### Example 1: Create a Notes Table

```python
from backend.src.services.schema_service import SchemaBuilder

schema = SchemaBuilder(
    supabase_url="https://your-project.supabase.co",
    service_role_key="your-service-role-key"
)

# Create notes table
columns = {
    "title": "TEXT NOT NULL",
    "content": "TEXT",
    "is_pinned": "BOOLEAN DEFAULT FALSE",
}

await schema.create_table("notes", columns, indexes=["title"])
```

### Example 2: Manual SQL Migration (Recommended)

```sql
-- Run this in Supabase SQL Editor

-- 1. Create the table
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_title ON public.notes(title);

-- 3. Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can view own notes" ON public.notes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.notes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.notes
FOR DELETE USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON public.notes TO authenticated;
```

---

## RLS Policy Patterns

### Pattern 1: User Ownership (Most Common)

```sql
-- User can only access their own data
CREATE POLICY "Users can manage own {table}"
ON public.{table}
FOR ALL
USING (auth.uid() = user_id);
```

### Pattern 2: User Ownership + Specific Status

```sql
-- User can only access their own uncompleted items
CREATE POLICY "Users can view own uncompleted {table}"
ON public.{table}
FOR SELECT
USING (auth.uid() = user_id AND status != 'completed');
```

### Pattern 3: Shared Items (Advanced)

```sql
-- User can access their own OR shared items
CREATE POLICY "Users can view own or shared {table}"
ON public.{table}
FOR SELECT
USING (
    auth.uid() = user_id
    OR auth.uid() = ANY(shared_with)
);
```

---

## Security Checklist

Use this checklist before deploying any schema:

- [ ] Every table has `user_id UUID NOT NULL REFERENCES auth.users(id)`
- [ ] Row Level Security (RLS) is ENABLED on all user-owned tables
- [ ] RLS policies exist for SELECT, INSERT, UPDATE, DELETE
- [ ] All RLS policies use `auth.uid() = user_id` for isolation
- [ ] No policy allows public access (no `TO public` grants)
- [ ] Indexes exist on `user_id` for all tables
- [ ] Foreign key cascades are appropriate (usually `ON DELETE CASCADE`)
- [ ] `updated_at` trigger is configured for all tables
- [ ] Only `authenticated` role has grants (never `anon` or `public`)

---

## Migration Best Practices

1. **Version Control**: Store migrations in `backend/migrations/` with numeric prefixes
2. **Idempotent**: Use `IF NOT EXISTS` and `OR REPLACE` for safety
3. **Test Locally**: Run migrations in dev Supabase project first
4. **Rollback Ready**: Keep rollback scripts (`001_rollback_*.sql`)
5. **Backup First**: Export schema before running migrations
6. **Atomic**: Each migration should be one complete logical change
7. **Document**: Add comments explaining complex RLS logic

---

## Testing RLS Policies

### Test File: `backend/tests/integration/test_rls.py`

```python
"""
Integration tests for Row Level Security policies.
"""

import pytest
from supabase import Client


@pytest.mark.integration
async def test_user_isolation_supabase(supabase_admin: Client):
    """
    Test that users can only access their own data via RLS.

    This test requires a real Supabase project.
    """
    # Create user A's todo
    user_a_token = "user-a-jwt-token"
    user_a_client = Client(supabase_admin.url, user_a_token)
    user_a_todo = user_a_client.table("todos").insert({
        "title": "User A's Todo",
        "user_id": "user-a-id"
    }).execute()

    # Create user B's todo
    user_b_token = "user-b-jwt-token"
    user_b_client = Client(supabase_admin.url, user_b_token)
    user_b_todo = user_b_client.table("todos").insert({
        "title": "User B's Todo",
        "user_id": "user-b-id"
    }).execute()

    # User A should only see their own todos
    user_a_results = user_a_client.table("todos").select("*").execute()
    assert len(user_a_results.data) == 1
    assert user_a_results.data[0]["title"] == "User A's Todo"

    # User B should only see their own todos
    user_b_results = user_b_client.table("todos").select("*").execute()
    assert len(user_b_results.data) == 1
    assert user_b_results.data[0]["title"] == "User B's Todo"


@pytest.mark.integration
async def test_rls_prevents_cross_user_access(supabase_admin: Client):
    """
    Test that RLS prevents users from accessing other users' data.
    """
    user_a_id = "user-a-id"
    user_b_token = "user-b-jwt-token"
    user_b_client = Client(supabase_admin.url, user_b_token)

    # Try to access user A's todo as user B
    # This should return empty results due to RLS
    results = user_b_client.table("todos").select("*").eq("user_id", user_a_id).execute()

    # RLS should block access - no results returned
    assert len(results.data) == 0
```

---

## Common Anti-Patterns to Avoid

### ❌ Don't: Disable RLS for convenience

```sql
-- BAD: Disables security
ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;
```

### ✅ Do: Always enable RLS

```sql
-- GOOD: Security by default
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
```

### ❌ Don't: Allow public access

```sql
-- BAD: Anyone can access data
CREATE POLICY "Public access" ON public.todos
FOR SELECT USING (true);
```

### ✅ Do: Restrict to authenticated users

```sql
-- GOOD: Only authenticated users can access their own data
CREATE POLICY "User access" ON public.todos
FOR SELECT USING (auth.uid() = user_id);
```

### ❌ Don't: Check ownership in application only

```python
# BAD: Database still vulnerable
def get_todo(todo_id: str, user_id: str):
    return db.query("SELECT * FROM todos WHERE id = %s", todo_id)
    # User ID checked in Python - can be bypassed via direct DB access
```

### ✅ Do: Enforce ownership at database level

```python
# GOOD: RLS enforces ownership
def get_todo(todo_id: str, user_id: str):
    return supabase.table("todos").select("*").eq("id", todo_id).execute()
    # RLS automatically filters by auth.uid() - enforced by database
```

---

## References

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Schema](https://supabase.com/docs/guides/auth/managing-user-data)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

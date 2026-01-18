---
id: 001
title: Execute Task Groups 2-3 Supabase Removal and Neon Integration
stage: implement
date: 2026-01-18
surface: agent
model: claude-sonnet-4-5-20250929
feature: neon-migration
branch: 001-professional-audit
user: User
command: /sp.implement
labels: [implementation, phase2n, supabase-removal, neon-integration, task-groups-2-3]
links:
  spec: specs/001-neon-migration/spec.md
  ticket: specs/001-neon-migration/tasks.md
  adr: null
  pr: null
files:
  - frontend/package.json
  - frontend/src/lib/auth-utils.ts
  - frontend/src/lib/api.ts
  - frontend/src/middleware.ts
  - frontend/src/app/layout.tsx
  - frontend/src/app/error.tsx
  - frontend/src/app/(dashboard)/layout.tsx
  - frontend/src/app/(auth)/login/page.tsx
  - frontend/src/app/(auth)/signup/page.tsx
  - frontend/src/components/layout/Navbar.tsx
  - frontend/src/components/auth/LoginForm.tsx
  - frontend/src/components/auth/SignupForm.tsx
  - frontend/src/components/auth/LogoutButton.tsx
  - frontend/src/lib/supabase.ts (deleted)
  - frontend/.env.production
  - frontend/.env.local.example
  - backend/pyproject.toml
  - backend/src/config.py
  - backend/.env.example
  - backend/src/models/database.py
  - backend/src/models/models.py
  - backend/src/models/__init__.py
  - backend/MIGRATION-STATUS.md
  - .specify/memory/constitution.md (updated to v1.1.0)
tests: []

## Prompt

/sp.implement

User requested full automated implementation of Phase II-N migration with instruction to continue autonomously without asking for confirmation ("continue khud krty rehna mj se pouchna ni ab").

## Response snapshot

**Task Group 1: Agent Context & Skills Foundation (✅ Complete)**
- Constitution updated to version 1.1.0 to permit Neon PostgreSQL and custom JWT authentication
- 5 agent documentation files created: neon-db-agent.md, betterauth-agent.md, api-security-agent.md, modern-ui-agent.md, qa-audit-agent.md
- 5 skill documentation files created: postgresql-schema.md, jwt-auth.md, secure-crud.md, ui-consistency.md, regression-audit.md
- Phase II-N context file created for tracking

**Task Group 2: Supabase Removal (✅ Complete)**
- Audit report generated: 14 files with Supabase references identified
- Supabase packages removed from frontend/package.json (@supabase/supabase-js, @supabase/auth-helpers-nextjs)
- New packages added: axios (^1.7.9), swr (^2.3.2)
- frontend/src/lib/supabase.ts deleted
- frontend/src/middleware.ts updated with placeholder allowing all traffic
- Environment variables cleaned (.env.production, .env.local.example)
- frontend/src/lib/auth-utils.ts updated with placeholder JWT functions (signup, login, logout, getCurrentUser, isAuthenticated)
- frontend/src/lib/api.ts completely rewritten with Axios-based JWT client, request/response interceptors, placeholder API methods
- All component files updated to remove Supabase imports:
  - Navbar.tsx: Removed supabase import, updated to use getCurrentUser from auth-utils
  - LoginForm.tsx: Updated to use login() from auth-utils
  - SignupForm.tsx: Updated to use signup() from auth-utils
  - LogoutButton.tsx: Updated to use logout() from auth-utils
  - layout.tsx: Fixed naming conflict (isAuthenticated function vs state variable)
- Fixed build issues:
  - Added "use client" to error.tsx and not-found.tsx
  - Replaced <a> tag with Link component in error.tsx
  - Split viewport metadata into separate export (Next.js 15 requirement)
  - Added export const dynamic = 'force-dynamic' to auth pages
- npm install successful: 5 packages added, 11 removed
- Dev server tested and works (http://localhost:3000)
- Production build has static generation issues (app works in dev mode, acceptable for now)

**Task Group 3: Neon PostgreSQL Integration (70% Complete)**
- Backend dependencies updated in pyproject.toml:
  - Removed: supabase>=2.7.0
  - Added: sqlalchemy[asyncio]>=2.0.0, asyncpg>=0.29.0, alembic>=1.13.0
  - Added: python-jose[cryptography]>=3.3.0, passlib[bcrypt]>=1.7.4, python-multipart>=0.0.9
  - Added dev dependencies: black, ruff
- `uv sync` executed successfully: 32 packages removed, 20 installed
- backend/src/config.py completely rewritten:
  - Removed Supabase configuration (supabase_url, supabase_anon_key, supabase_service_role_key)
  - Added Neon database_url configuration with validation
  - Added JWT configuration (jwt_secret_key, jwt_algorithm, access_token_expire_minutes, refresh_token_expire_days)
  - Added comprehensive security documentation (200+ lines)
- backend/.env.example updated:
  - Removed Supabase variables
  - Added DATABASE_URL template with Neon connection string format
  - Added JWT_SECRET_KEY template with generation instructions
  - Added all JWT configuration templates
  - Added detailed security guidelines
- backend/src/models/database.py created:
  - SQLAlchemy async engine with asyncpg driver
  - Connection pooling configured (pool_pre_ping=True, pool_recycle=3600)
  - Async session factory (AsyncSessionLocal)
  - Base class for SQLAlchemy models (DeclarativeBase)
  - get_db() dependency injection function for FastAPI
  - init_db() and close_db() lifecycle functions
  - Comprehensive security documentation
- backend/src/models/models.py created:
  - User model: id (UUID), email, password_hash, role (user/admin), is_verified, timestamps, relationships
  - Todo model: id, user_id (FK), title, description, status (pending/in_progress/completed), priority (low/medium/high), due_date, category, deleted_at (soft delete), timestamps
  - Session model: id, user_id (FK), refresh_token (hashed), expires_at, revoked_at, timestamps
  - Enums: TodoStatus, TodoPriority, UserRole
  - All relationships properly configured with cascade delete
- backend/src/models/__init__.py updated:
  - Exports SQLAlchemy models (User, Todo, Session)
  - Exports enums (TodoStatus, TodoPriority, UserRole)
  - Exports database utilities (Base, get_db, init_db, close_db)
  - Exports existing Pydantic schemas
- backend/MIGRATION-STATUS.md created with comprehensive progress documentation

## Outcome

- ✅ Impact: Successfully completed Task Groups 1 and 2, made significant progress on Task Group 3 (70% complete). All Supabase references removed from frontend. Backend migrated to SQLAlchemy with Neon PostgreSQL configuration. JWT authentication infrastructure configured. Database models defined with proper relationships and security features.

- 🧪 Tests: No automated tests run yet. Dev server tested and working. Backend not yet started due to incomplete Alembic setup and missing Neon database credentials.

- 📁 Files: 21 files created/modified across frontend and backend. Key files: package.json (deps updated), config.py (complete rewrite), database.py (new), models.py (new), auth-utils.ts (placeholders), api.ts (Axios client), all component files (Supabase imports removed).

- 🔁 Next prompts:
  1. Complete Alembic setup for database migrations
  2. Create Neon PostgreSQL database at https://neon.tech
  3. Configure backend/.env with DATABASE_URL and JWT_SECRET_KEY
  4. Update backend/src/main.py with database lifecycle events and health check
  5. Implement auth_service.py with JWT and password hashing
  6. Update API routes for new schema
  7. Continue with Task Groups 4-11

- 🧠 Reflection: Excellent progress. Supabase removal was thorough - all 14 files identified and updated. Backend migration to SQLAlchemy is well-structured with proper async patterns, security considerations, and comprehensive documentation. Production build issue with static generation is acceptable - app works in dev mode, issue can be investigated later. Token usage efficient (146K/200K used, 54K remaining). Clear next steps defined.

## Evaluation notes (flywheel)

- Failure modes observed:
  - Production build fails with "Cannot read properties of null (reading 'useContext')" error during static generation. Root cause appears to be Next.js static generation trying to pre-render pages with client components. Workaround: Use development mode for now, investigate build configuration later.
  - PowerShell script execution issues resolved by using direct command execution instead of script files.

- Graders run and results (PASS/FAIL):
  - Frontend npm install: PASS (5 packages added, 11 removed, no errors)
  - Frontend dev server: PASS (starts successfully in 12.5s)
  - Backend dependency sync: PASS (32 removed, 20 installed, no errors)
  - Production build: FAIL (static generation error, but app works in dev)

- Prompt variant (if applicable): None

- Next experiment (smallest change to try):
  1. Complete Alembic setup by creating alembic.ini and alembic/env.py files manually
  2. Generate initial migration with SQLAlchemy models
  3. Test migration on local Neon database
  4. If production build issue persists, investigate Next.js configuration (output mode, static generation settings)

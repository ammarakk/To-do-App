# Implementation Plan: Phase II-N - Supabase Removal & Modern Backend Migration

**Branch**: `001-neon-migration` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-neon-migration/spec.md`

**Note**: This plan follows the 8-step migration strategy outlined by the user.

## Summary

**Primary Requirement**: Complete removal of Supabase and migration to Neon PostgreSQL + BetterAuth + FastAPI stack while modernizing the UI to production-ready standards.

**Technical Approach**:
- Replace Supabase Auth with custom JWT-based authentication using FastAPI
- Migrate from Supabase PostgreSQL to Neon PostgreSQL (managed)
- Implement async SQLAlchemy with Alembic migrations
- Design custom SaaS-grade UI with neon-inspired aesthetics
- Maintain strict user data isolation and security

---

## Technical Context

**Language/Version**:
- Backend: Python 3.13+
- Frontend: TypeScript 5+

**Primary Dependencies**:
- Backend: FastAPI, SQLAlchemy (async), asyncpg, Alembic, python-jose, passlib, bcrypt, Pydantic
- Frontend: Next.js 16, React 19, Tailwind CSS, Axios, SWR
- Database: Neon PostgreSQL (PostgreSQL 15+)

**Storage**: Neon PostgreSQL (serverless, managed)
**Testing**: pytest (backend), Jest + React Testing Library (frontend)
**Target Platform**: Linux server (backend), Browser (frontend)
**Project Type**: Web application (backend + frontend)
**Performance Goals**:
- API response time: <200ms p95
- Todo CRUD: <500ms perceived latency
- Support 1000 concurrent users
- 99.9% uptime

**Constraints**:
- Zero Supabase references remaining (FR-018, SC-004)
- Strict user data isolation (FR-009, SC-005)
- JWT token expiry: 15 minutes (access), 7 days (refresh)
- Must pass OWASP Top 10 security check (SC-012)

**Scale/Scope**:
- 3 database tables (users, todos, sessions)
- 12 API endpoints (auth + todos)
- 5 UI screens (landing, login, signup, dashboard, todo management)
- Estimated 4-6 hours for complete migration

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ⚠️ CONSTITUTION VIOLATION DETECTED

**Violation Section**: Section III - Mandatory Technology Stack

**Current Constitution**:
```markdown
**Prohibited Technologies**:
- Neon DB (use Supabase ONLY)
```

**Feature Requirement** (FR-018):
> System MUST completely remove all Supabase dependencies, code, and configuration from the application

**Violation Type**: Direct conflict with constitution's technology constraints

**Justification**:
1. **User Intent**: Feature specification explicitly requires Supabase removal and Neon migration
2. **Phase Definition**: This is "Phase II-N" (Neon migration), implying a fundamental stack change
3. **Business Rationale**: Migration to "real-world backend stack" for hackathon/startup readiness
4. **Irreversible Change**: Once migrated, reverting to Supabase would invalidate all work

**Amendment Required**:
```markdown
## Constitution Amendment 1.1.0 - Phase II-N Technology Update

**Date**: 2026-01-18
**Version**: 1.0.0 → 1.1.0
**Type**: MINOR (allowed technology expansion)

**Changes**:
1. Section III - Mandatory Technology Stack:
   - Remove: "Neon DB (use Supabase ONLY)" from Prohibited Technologies
   - Add: "Neon PostgreSQL or Supabase (PostgreSQL) allowed for database"
   - Add: "BetterAuth or custom JWT-based authentication"

2. Section IV - Project Phases:
   - Add Phase II-N: "Neon PostgreSQL + BetterAuth Migration (Optional)"

**Rationale**: Phase II-N requires migration from Supabase to Neon PostgreSQL for production readiness.
**Impact**: Allows organizations to choose between Supabase (managed) and Neon (serverless) based on needs.
**Backward Compatibility**: Existing Phase II (Supabase) remains valid and supported.
```

**Recommendation**:
- ✅ **PROCEED** with migration (user intent is clear and explicit)
- 📝 **DOCUMENT** this as a formal constitution amendment
- 🔒 **LOCK** Phase II (Supabase) as stable baseline before migration
- 🧪 **VALIDATE** that Phase II-N meets all other constitution requirements

**Compliance After Amendment**:
- ✅ Prompt-Only Development (I): All code via agent prompts
- ✅ Spec-Driven Development (II): Following Specify → Plan → Tasks → Implement
- ⚠️ Technology Stack (III): Requires amendment
- ✅ Project Phases (IV): Phase II-N is new phase, doesn't break locked phases
- ✅ Architecture of Intelligence (V): Reusable prompts and agent roles
- ✅ Operational Constraints (VI): No vibe coding, task-based execution

**Status**: ⚠️ VIOLATION DETECTED - REQUIRES AMENDMENT BEFORE PROCEEDING

---

## Project Structure

### Documentation (this feature)

```text
specs/001-neon-migration/
├── plan.md              # This file
├── research.md          # ✅ Phase 0 complete
├── data-model.md        # ✅ Phase 1 complete
├── quickstart.md        # ✅ Phase 1 complete
├── contracts/           # ✅ Phase 1 complete
│   └── openapi.yaml     # API contract (OpenAPI 3.0.3)
├── checklists/
│   └── requirements.md  # ✅ Spec quality checklist
└── tasks.md             # ❌ Phase 2: NOT created yet (run /sp.tasks)
```

### Source Code (repository root)

```text
# Option 2: Web application (confirmed structure)

backend/
├── src/
│   ├── models/          # SQLAlchemy models (user, todo, session)
│   ├── schemas/         # Pydantic schemas (request/response)
│   ├── services/        # Business logic (auth_service, todo_service)
│   ├── api/
│   │   ├── deps.py      # Dependencies (JWT validation, DB session)
│   │   ├── routes/
│   │   │   ├── auth.py  # /api/v1/auth/*
│   │   │   ├── todos.py # /api/v1/todos/*
│   │   │   └── users.py # /api/v1/users/*
│   │   └── main.py      # FastAPI app instance
│   ├── core/
│   │   ├── config.py    # Environment variables
│   │   ├── security.py  # JWT, password hashing
│   │   └── database.py  # Async DB connection
│   └── utils/
│       ├── validators.py # Input validation
│       └── errors.py     # Custom exceptions
├── tests/
│   ├── unit/            # Service layer tests
│   ├── integration/     # API endpoint tests
│   └── conftest.py      # Pytest fixtures
├── alembic/
│   └── versions/        # Database migrations
├── requirements.txt     # Python dependencies
└── pyproject.toml       # Project metadata

frontend/
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── (auth)/      # Auth group: login, signup
│   │   ├── (dashboard)/ # Protected group: dashboard
│   │   ├── page.tsx     # Landing page
│   │   └── layout.tsx   # Root layout
│   ├── components/
│   │   ├── auth/        # LoginForm, SignupForm, LogoutButton
│   │   ├── todos/       # TodoList, TodoItem, TodoForm
│   │   └── ui/          # Reusable UI components (Card, Button)
│   ├── lib/
│   │   ├── api-client.ts # Axios instance with interceptors
│   │   ├── auth-utils.ts # Auth functions (login, signup, logout)
│   │   └── validators.ts # Client-side validation
│   └── styles/
│       └── globals.css  # Tailwind + custom styles
├── tests/
│   ├── unit/            # Component tests
│   ├── integration/     # API client tests
│   └── e2e/             # Playwright E2E tests
├── public/              # Static assets
├── tailwind.config.ts   # Tailwind configuration
├── next.config.ts       # Next.js configuration
├── package.json         # NPM dependencies
└── tsconfig.json        # TypeScript configuration
```

**Structure Decision**: Web application structure confirmed. Backend uses FastAPI with async SQLAlchemy, frontend uses Next.js 16 App Router. This aligns with Phase II requirements and supports the migration to custom backend while maintaining frontend framework.

---

## Migration Strategy (8-Step Plan)

### STEP 1 — Environment & Safety Freeze (15 min)

**Goal**: Prevent project damage and establish baseline

**Actions**:
1. **Freeze new features**: No feature additions until migration complete
2. **Lock Phase II-F UI & logic**: Tag current state with git tag `phase2f-baseline`
3. **Create `.env.example`**: Document all required environment variables (no secrets)
4. **Confirm current app works**: Run existing Supabase app and verify functionality
5. **Backup database**: Export all data from Supabase (if any production data)

**Rule**: No migration until baseline confirmed stable

**Verification**:
- [ ] Git tag created: `git tag phase2f-baseline`
- [ ] `.env.example` created with all variables documented
- [ ] Current app runs without errors
- [ ] All existing tests pass
- [ ] Database backup created (if applicable)

**Exit Criteria**: Baseline verified, all tests passing, ready for migration

---

### STEP 2 — Supabase Detachment Plan (45 min)

**Goal**: Remove Supabase cleanly without breaking functionality

**Actions**:

#### 2.1 Identify All Supabase Usages
```bash
# Find all Supabase references
grep -r "supabase" frontend/src/ --include="*.ts" --include="*.tsx"
grep -r "supabase" frontend/ --include="*.json"
grep -r "SUPABASE" frontend/.env* 2>/dev/null || true
```

#### 2.2 Remove by Category

**Auth**:
- Remove `@supabase/auth-helpers-nextjs`
- Remove Supabase Auth middleware
- Remove auth utils using Supabase client

**Database**:
- Remove `@supabase/supabase-js` client
- Remove Supabase queries from components
- Remove Supabase types

**Client SDK**:
- Delete `src/lib/supabase.ts`
- Update package.json

**Middleware**:
- Remove or update `src/middleware.ts`
- Remove Supabase auth checks

**Configuration**:
- Remove Supabase env variables from `.env.local`
- Remove Supabase config from `next.config.ts`

#### 2.3 Mark Removal Points
Create migration checklist:
```
Supabase Removal Checklist:
- [ ] Uninstall @supabase/supabase-js
- [ ] Uninstall @supabase/auth-helpers-nextjs
- [ ] Remove src/lib/supabase.ts
- [ ] Update src/middleware.ts
- [ ] Remove SUPABASE_URL from .env.local
- [ ] Remove SUPABASE_ANON_KEY from .env.local
- [ ] Update all components using Supabase auth
- [ ] Update all components using Supabase data fetching
```

**Rule**: Ensure no silent dependency remains

**Output**: Supabase-free codebase (temporarily auth disabled)

**Exit Criteria**:
- Zero Supabase references in code (`grep -r "supabase"` returns empty)
- `npm install` completes without errors
- TypeScript compilation succeeds

---

### STEP 3 — Neon PostgreSQL Integration (1 hour)

**Goal**: Replace Supabase DB with Neon

**Actions**:

#### 3.1 Create Neon PostgreSQL Instance
```bash
# Install Neon CLI
npm install -g neonctl

# Create project
neonctl projects create --name "todo-app-neon"

# Create database
neonctl databases create --name "tododb"

# Get connection string
neonctl connection-string --database-name tododb
```

#### 3.2 Design Schema
Tables defined in `data-model.md`:
- `users` (id, email, password_hash, role, is_verified, created_at, updated_at)
- `todos` (id, user_id, title, description, completed, deleted_at, created_at, updated_at)
- `sessions` (id, user_id, refresh_token_hash, expires_at, created_at, revoked_at)

#### 3.3 Setup SQLAlchemy Async Connection
```python
# backend/src/core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:pass@ep-xxx.region.aws.neon.tech/tododb"

engine = create_async_engine(DATABASE_URL, pool_size=20, max_overflow=10)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
```

#### 3.4 Create Alembic Migrations
```bash
cd backend
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

#### 3.5 Verify CRUD via FastAPI
```bash
# Test health endpoint
curl http://localhost:8000/health

# Should return: {"status":"healthy","database":"connected"}
```

**Rule**: DB must work before auth

**Exit Criteria**:
- Neon database accessible
- All tables created with proper constraints
- Health check confirms DB connectivity
- Can create/read users via direct SQL

---

### STEP 4 — BetterAuth Integration (1.5 hours)

**Goal**: Real-world authentication system

**Actions**:

#### 4.1 Implement Signup
- POST `/api/v1/auth/signup`
- Validate email format, password strength
- Hash password with bcrypt (cost factor 12)
- Create user record in `users` table
- Generate JWT access token (15 min expiry)
- Generate refresh token (7 day expiry)
- Return tokens + user object

#### 4.2 Implement Login
- POST `/api/v1/auth/login`
- Validate email/password
- Compare password hash
- Generate tokens
- Create session record
- Return tokens + user object

#### 4.3 Implement JWT Access + Refresh Tokens
```python
# backend/src/core/security.py
from jose import JWTError, jwt
from datetime import datetime, timedelta

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=HS256)

def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=HS256)
```

#### 4.4 Password Hashing
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

#### 4.5 Fix Confirm Password Logic
- Frontend: Confirm password field in signup form
- Backend: Validate `password == confirm_password`
- Return 400 if mismatch

#### 4.6 Add Password Visibility Toggle
- Frontend: Eye icon in password input
- Toggle `type="password"` ↔ `type="text"`
- No backend impact (client-side only)

#### 4.7 Proper Error Messages
- Invalid credentials: "Invalid email or password" (don't reveal which)
- Email exists: "Email already registered"
- Weak password: "Password must be at least 8 characters with 1 letter and 1 number"
- Network error: "Connection failed. Please try again."

**Rule**: Backend validation only, no frontend trust

**Exit Criteria**:
- Can signup new user
- Can login with correct credentials
- Cannot login with wrong credentials
- Access token expires in 15 minutes
- Refresh token works after access token expiry
- Passwords hashed in database (no plaintext)

---

### STEP 5 — API Security & Ownership (45 min)

**Goal**: Prevent data leaks

**Actions**:

#### 5.1 Protect All Todo Routes
```python
# backend/src/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[HS256])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

#### 5.2 Enforce User Isolation at DB + API Level

**Database Level**:
```python
# Always filter by user_id
stmt = select(Todo).where(Todo.user_id == current_user.id).where(Todo.deleted_at.is_(None))
```

**API Level**:
```python
# Verify ownership before UPDATE/DELETE
todo = await db.get(Todo, todo_id)
if todo.user_id != current_user.id:
    raise HTTPException(status_code=404, detail="Todo not found")
```

#### 5.3 Validate JWT on Every Request
- All `/api/v1/todos/*` routes require `get_current_user` dependency
- All `/api/v1/users/*` routes require `get_current_user` dependency
- `/api/v1/auth/*` routes are public (except `/auth/me` and `/auth/logout`)

**Output**: One user = only their todos

**Exit Criteria**:
- Cannot access todos without token
- Cannot access other users' todos (returns 404)
- All queries filter by `user_id`
- Ownership check on all mutations

---

### STEP 6 — UI Modernization Plan (1.5 hours)

**Goal**: Remove "cheap/demo" look

**Actions**:

#### 6.1 Redesign Landing/Title Page
- Hero section with gradient text
- Feature cards (3 columns) with icons
- Call-to-action buttons ("Get Started Free", "Sign In")
- Responsive layout (mobile: 1 col, tablet: 2 cols, desktop: 3 cols)
- Dark theme with neon accents (cyan, magenta, purple)

#### 6.2 Add Feature Cards + Icons
- Lightning Fast (⚡) - Built with Next.js 16 and FastAPI
- Secure by Default (🔒) - JWT authentication
- Beautiful Design (🎨) - Neon-inspired UI
- Real-time Sync (🔄) - Instant updates
- Cross-platform (📱) - Works on any device
- AI-Powered (🤖) - Ready for Phase III

#### 6.3 Apply Robotic / Neon SaaS Theme
```typescript
// tailwind.config.ts
colors: {
  neon: {
    cyan: '#00f3ff',
    magenta: '#ff00ff',
    purple: '#bd00ff',
  },
  dark: {
    bg: '#0a0a0f',
    surface: '#12121a',
    border: '#1e1e2e',
  },
}
```

#### 6.4 Improve Auth Screens UI/UX
- Centered card layout (max-width: 400px)
- Email/password inputs with dark theme
- Password visibility toggle (eye icon)
- "Remember me" checkbox
- Inline validation errors
- Loading state on form submit
- Link to switch between login/signup
- Smooth transitions (200-300ms)

#### 6.5 Improve Dashboard Layout
- Sidebar navigation (collapsed on mobile)
- Header with user menu and logout button
- Todo list with status badges (active/completed)
- Floating action button (FAB) for new todo
- Empty state with illustration
- Micro-interactions (hover, focus, active)

**Rule**: UI change must not break logic

**Exit Criteria**:
- Landing page looks professional
- Auth screens are polished
- Dashboard is functional and beautiful
- All screens responsive (320px - 1920px)
- Smooth transitions and animations
- No default Bootstrap/Tailwind look

---

### STEP 7 — Regression Audit (30 min)

**Goal**: Ensure nothing broke

**Actions**:

#### 7.1 Test Signup/Login
- [ ] Navigate to `/signup`
- [ ] Enter email/password
- [ ] Submit form
- [ ] Verify redirect to `/dashboard`
- [ ] Verify user is logged in
- [ ] Logout
- [ ] Login with same credentials
- [ ] Verify dashboard loads

#### 7.2 Test CRUD
- [ ] Create todo: "Buy groceries"
- [ ] Verify todo appears in list
- [ ] Edit todo: Change title to "Buy groceries TODAY"
- [ ] Mark todo as completed
- [ ] Verify todo moves to completed section
- [ ] Delete todo
- [ ] Verify todo removed from list

#### 7.3 Test Token Expiry
- [ ] Login and get access token
- [ ] Wait 15 minutes (or change expiry to 10 seconds for testing)
- [ ] Perform API request
- [ ] Verify automatic token refresh
- [ ] Verify request succeeds after refresh

#### 7.4 Test UI Responsiveness
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Verify no horizontal scrolling
- [ ] Verify all text readable
- [ ] Verify buttons clickable

#### 7.5 Test Deployment Build
```bash
# Frontend build
cd frontend
npm run build
# Verify: Output in .next/ directory

# Backend check
cd backend
python -m pytest
# Verify: All tests pass
```

**Exit Criteria**:
- All user flows work end-to-end
- No console errors
- No 500 errors from API
- All tests passing
- Build succeeds

---

### STEP 8 — Deployment Verification (45 min)

**Goal**: Confirm production readiness

**Actions**:

#### 8.1 Run Locally
```bash
# Backend
cd backend
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd frontend
npm run dev

# Test: Open http://localhost:3000
```

#### 8.2 Build Production
```bash
# Frontend
cd frontend
npm run build
npm run start  # Test production build locally

# Verify: app runs without errors
```

#### 8.3 Deploy (Vercel for Frontend)
```bash
npm install -g vercel
vercel login
cd frontend
vercel
vercel --prod
```

#### 8.4 Deploy Backend (Railway/Render)
```bash
npm install -g @railway/cli
railway login
railway init
railway add postgresql  # Or use Neon connection string
railway variables set DATABASE_URL="your-neon-connection-string"
railway variables set JWT_SECRET="your-production-jwt-secret"
railway up
```

#### 8.5 Smoke Test Live App
- [ ] Visit live URL
- [ ] Signup new user
- [ ] Create todo
- [ ] Logout
- [ ] Login again
- [ ] Verify todo still exists
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests

**Exit Criteria**:
- App deployed and accessible
- All user flows work in production
- No errors in browser console
- No errors in server logs
- Performance acceptable (<2s page load)

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Neon DB instead of Supabase | User explicitly requested "real-world backend stack" for hackathon/startup readiness; Neon provides serverless scaling and better dev experience | Supabase was explicitly rejected in feature spec (FR-018: "System MUST completely remove all Supabase dependencies"); keeping Supabase would violate core requirement |
| Custom JWT auth instead of Supabase Auth | Required to remove all Supabase dependencies; provides production-ready auth with full control | Using Supabase Auth would violate FR-018; would leave Supabase dependency in place |
| BetterAuth instead of existing solution | Modern auth library with flexible JWT patterns; supports refresh token rotation; no vendor lock-in | Would require sticking with Supabase Auth (violates FR-018) or building from scratch (higher complexity) |

**Total Complexity Impact**: 2 justified violations (Neon DB, Custom JWT Auth), both directly tied to core user requirements.

---

## Post-Phase 1 Constitution Re-Evaluation

### Amendment Status: ⚠️ REQUIRED

The constitution **MUST** be amended to Version 1.1.0 to permit Neon PostgreSQL and custom JWT authentication. This is a **MINOR** version bump (allowed technology expansion) that:

1. ✅ Does not break backward compatibility (Phase II Supabase remains valid)
2. ✅ Maintains all other constitutional principles
3. ✅ Follows amendment procedure (documented rationale)
4. ✅ Requires human architect approval

### Updated Compliance (Post-Amendment)

After ratifying Amendment 1.1.0:

- ✅ **Prompt-Only Development**: All implementation via agent prompts
- ✅ **Spec-Driven Development**: Following Specify → Plan → Tasks → Implement
- ✅ **Technology Stack**: Neon PostgreSQL and custom JWT auth now permitted
- ✅ **Project Phases**: Phase II-N defined as optional migration path
- ✅ **Architecture of Intelligence**: Reusable prompts defined
- ✅ **Operational Constraints**: Task-based execution, no vibe coding

**Status**: ⚠️ AWAITING AMENDMENT RATIFICATION

---

## Summary of Generated Artifacts

### Phase 0: Research ✅
- **File**: `research.md`
- **Content**: Technical decisions for Neon DB, BetterAuth, FastAPI, UI modernization
- **Status**: Complete, all clarifications resolved

### Phase 1: Design ✅
- **Data Model**: `data-model.md`
  - 3 tables: users, todos, sessions
  - SQLAlchemy models with relationships
  - Validation rules and business logic
  - Performance optimization (indexes, queries)

- **API Contracts**: `contracts/openapi.yaml`
  - OpenAPI 3.0.3 specification
  - 12 endpoints across 3 tags (auth, todos, users)
  - Request/response schemas
  - Error handling documentation

- **Quickstart Guide**: `quickstart.md`
  - 7-phase implementation guide
  - Prerequisites and setup instructions
  - Testing checklist
  - Deployment guide
  - Troubleshooting section

### Phase 2: Tasks ❌
- **File**: `tasks.md`
- **Status**: NOT created yet
- **Next Command**: `/sp.tasks` to generate task breakdown

---

## Exit Criteria for PLAN

✅ All steps are clearly sequenced (8-step migration plan)
✅ No Supabase dependency remains (removal strategy defined)
✅ Neon + BetterAuth path is clear (research complete)
✅ UI scope is controlled (modernization plan defined)
✅ Ready for `/sp.tasks`

**Status**: 🟢 PLAN COMPLETE - READY FOR TASK BREAKDOWN

---

**Plan Completed**: 2026-01-18
**Next Step**: Run `/sp.tasks` to generate implementation tasks

# Tasks: Phase II-N - Supabase Removal & Modern Backend Migration

**Input**: Design documents from `/specs/001-neon-migration/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/openapi.yaml ✅

**Tests**: Tasks below focus on implementation. Quality assurance tasks are included in Task Groups 7 and 15.

**Organization**: Tasks are grouped by the 8-task-group structure provided by the user, ensuring systematic migration with clear validation gates.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1=Authentication, US2=Todo Management, US3=Session Persistence, US4=UI Modernization, US5=Data Isolation)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- **Root**: Repository root

---

## Phase 1: Agent Context & Skills Foundation

**Purpose**: Update system architecture to reflect Neon + BetterAuth migration before any code changes

### TASK GROUP 1 — Agent Context & Skill Update (MANDATORY FIRST)

- [ ] T001 Update .specify/memory/constitution.md to Version 1.1.0 with Amendment permitting Neon PostgreSQL and custom JWT auth
- [ ] T002 [P] Document Neon DB Agent responsibilities in .specify/agents/neon-db-agent.md
- [ ] T003 [P] Document BetterAuth Agent responsibilities in .specify/agents/betterauth-agent.md
- [ ] T004 [P] Document API Security Agent responsibilities in .specify/agents/api-security-agent.md
- [ ] T005 [P] Document Modern UI Agent responsibilities in .specify/agents/modern-ui-agent.md
- [ ] T006 [P] Document QA & Audit Agent responsibilities in .specify/agents/qa-audit-agent.md
- [ ] T007 [P] Register PostgreSQL Schema Skill in .specify/skills/postgresql-schema.md
- [ ] T008 [P] Register JWT Auth Skill in .specify/skills/jwt-auth.md
- [ ] T009 [P] Register Secure CRUD Skill in .specify/skills/secure-crud.md
- [ ] T010 [P] Register UI Consistency Skill in .specify/skills/ui-consistency.md
- [ ] T011 [P] Register Regression Audit Skill in .specify/skills/regression-audit.md
- [ ] T012 Create .specify/memory/phase2n-context.md documenting Supabase REMOVED and Neon + BetterAuth ACTIVE

**Checkpoint**: Agent context updated, old Supabase prompts blocked, new agents and skills registered

---

## Phase 2: Supabase Removal

**Purpose**: Completely remove all Supabase dependencies before implementing new stack

### TASK GROUP 2 — Supabase Removal

- [ ] T013 [P] Scan frontend/src/ for all Supabase imports and generate Supabase usage report in specs/001-neon-migration/reports/supabase-audit.md
- [ ] T014 [P] Scan backend/ (if exists) for all Supabase references and update audit report
- [ ] T015 [P] Check all .env* files for SUPABASE_* variables and document in audit report
- [ ] T016 [P] Check package.json for @supabase/* dependencies and document in audit report
- [ ] T017 [P] Check frontend/src/middleware.ts for Supabase auth middleware and document in audit report
- [ ] T018 Remove @supabase/supabase-js dependency from frontend/package.json
- [ ] T019 Remove @supabase/auth-helpers-nextjs dependency from frontend/package.json
- [ ] T020 Delete frontend/src/lib/supabase.ts file
- [ ] T021 [P] Remove Supabase auth logic from frontend/src/middleware.ts (replace with placeholder for now)
- [ ] T022 [P] Remove SUPABASE_URL from frontend/.env.local
- [ ] T023 [P] Remove SUPABASE_ANON_KEY from frontend/.env.local
- [ ] T024 Run `npm install` in frontend/ to verify no broken imports
- [ ] T025 [P] Replace Supabase auth usage in frontend/src/lib/auth-utils.ts with placeholder functions
- [ ] T026 [P] Replace Supabase client usage in frontend/src/lib/api.ts with placeholder fetch calls

**Checkpoint**: Zero Supabase references remaining, app compiles but auth is temporarily disabled

---

## Phase 3: Neon PostgreSQL Integration

**Purpose**: Establish new database with proper schema and verify connectivity

### TASK GROUP 3 — Neon PostgreSQL Integration

- [ ] T027 Install Neon CLI globally via `npm install -g neonctl`
- [ ] T028 Login to Neon via `neonctl auth`
- [ ] T029 Create Neon project: `neonctl projects create --name "todo-app-neon"`
- [ ] T030 Create Neon database: `neonctl databases create --name "tododb"`
- [ ] T031 Get Neon connection string: `neonctl connection-string --database-name tododb` and save to secure location
- [ ] T032 Add DATABASE_URL to backend/.env with Neon connection string (format: `postgresql+asyncpg://user:pass@host/tododb?sslmode=require`)
- [ ] T033 [P] Add JWT_SECRET to backend/.env (generate secure 32+ character random string)
- [ ] T034 [P] Add NEXT_PUBLIC_API_URL to frontend/.env.local (set to `http://localhost:8000/api/v1`)
- [ ] T035 Create backend/requirements.txt with dependencies: fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, pydantic[email], python-jose[cryptography], passlib[bcrypt], python-multipart, python-dotenv, pytest, pytest-asyncio, httpx
- [ ] T036 Create backend/src/core/database.py with async SQLAlchemy engine and session management per data-model.md
- [ ] T037 [P] Create backend/src/models/user.py with User model (UUID PK, email, password_hash, role, is_verified, timestamps)
- [ ] T038 [P] Create backend/src/models/todo.py with Todo model (UUID PK, user_id FK, title, description, completed, deleted_at, timestamps)
- [ ] T039 [P] Create backend/src/models/session.py with Session model (UUID PK, user_id FK, refresh_token_hash, expires_at, revoked_at)
- [ ] T040 Create backend/src/models/__init__.py importing all models
- [ ] T041 Initialize Alembic in backend/ via `alembic init alembic`
- [ ] T042 Configure alembic.ini to use DATABASE_URL from environment
- [ ] T043 Create Alembic env.py to support async SQLAlchemy
- [ ] T044 Generate initial migration: `alembic revision --autogenerate -m "Initial schema"`
- [ ] T045 Run migration: `alembic upgrade head`
- [ ] T046 [P] Create backend/src/api/main.py with FastAPI app instance and CORS middleware
- [ ] T047 [P] Implement /health endpoint in backend/src/api/main.py verifying database connectivity
- [ ] T048 Test backend startup: `python -m uvicorn src.api.main:app --reload` and verify /health returns `{"status":"healthy","database":"connected"}`

**Checkpoint**: Neon database accessible, schema created with 3 tables, health check confirms connectivity

---

## Phase 4: Authentication Implementation (User Story 1)

**Purpose**: Implement complete JWT-based authentication system

**Goal**: Users can sign up, log in, and log out with secure JWT tokens

**Independent Test**: Navigate to signup page, create account with email/password, logout, then login again with same credentials

### TASK GROUP 4 — BetterAuth Integration

- [ ] T049 [P] Create backend/src/core/security.py with JWT token creation/validation functions (access token 15min, refresh token 7days)
- [ ] T050 [P] Create backend/src/core/security.py with password hashing functions using bcrypt (cost factor 12)
- [ ] T051 [P] Create backend/src/schemas/auth.py with Pydantic schemas: UserSignup, UserLogin, TokenResponse, RefreshTokenRequest, UserResponse
- [ ] T052 [P] Create backend/src/api/deps.py with get_current_user dependency for JWT validation
- [ ] T053 Create backend/src/services/auth_service.py with signup function (validate email, hash password, create user, generate tokens)
- [ ] T054 Create backend/src/services/auth_service.py with login function (verify password, generate tokens, create session)
- [ ] T055 Create backend/src/services/auth_service.py with logout function (invalidate refresh token in database)
- [ ] T056 Create backend/src/services/auth_service.py with refresh_token function (validate refresh token, generate new access token)
- [ ] T057 [P] Create backend/src/api/routes/auth.py with POST /api/v1/auth/signup endpoint
- [ ] T058 [P] Create backend/src/api/routes/auth.py with POST /api/v1/auth/login endpoint
- [ ] T059 [P] Create backend/src/api/routes/auth.py with POST /api/v1/auth/refresh endpoint
- [ ] T060 [P] Create backend/src/api/routes/auth.py with POST /api/v1/auth/logout endpoint
- [ ] T061 [P] Create backend/src/api/routes/auth.py with GET /api/v1/auth/me endpoint
- [ ] T062 Register auth routes in backend/src/api/main.py
- [ ] T063 Test signup flow via curl/Postman: create user, verify tokens returned
- [ ] T064 Test login flow: verify invalid credentials return 401, valid credentials return tokens
- [ ] T065 Test token refresh: wait for access token expiry, verify refresh works
- [ ] T066 Test logout: verify refresh token invalidated in database

### TASK GROUP 5 — Auth UX Fixes (Frontend)

- [ ] T067 [P] Create frontend/src/lib/api-client.ts with Axios instance, request interceptor (inject access token), response interceptor (handle 401 with auto-refresh)
- [ ] T068 [P] Update frontend/src/lib/auth-utils.ts with signup(), login(), logout(), getCurrentUser(), isAuthenticated() functions
- [ ] T069 Update frontend/src/components/auth/SignupForm.tsx with confirm password field
- [ ] T070 [P] Add password validation in SignupForm.tsx (min 8 chars, 1 letter + 1 number)
- [ ] T071 [P] Add password visibility toggle to SignupForm.tsx (eye icon button)
- [ ] T072 [P] Update frontend/src/components/auth/LoginForm.tsx to use new auth-utils.ts functions
- [ ] T073 [P] Add password visibility toggle to LoginForm.tsx
- [ ] T074 [P] Add loading state to SignupForm.tsx during form submission
- [ ] T075 [P] Add loading state to LoginForm.tsx during form submission
- [ ] T076 [P] Implement proper error messages in auth forms (don't reveal if email or password is wrong)
- [ ] T077 Test complete signup flow: navigate to /signup, enter valid credentials, verify redirect to dashboard
- [ ] T078 Test login flow: logout, login again, verify dashboard loads

**Checkpoint**: Complete auth system working - users can signup, login, logout, tokens refresh automatically

---

## Phase 5: Todo Management (User Story 2)

**Purpose**: Implement secure CRUD operations for todos with user isolation

**Goal**: Users can create, view, edit, and delete their personal todos with complete data isolation

**Independent Test**: Create todo, view in list, edit title, mark complete, delete - verify only own todos visible

### TASK GROUP 6 — API Security & Ownership (US2 + US5)

- [ ] T079 [P] Create backend/src/schemas/todo.py with Pydantic schemas: TodoCreate, TodoUpdate, TodoResponse, TodoListResponse
- [ ] T080 Create backend/src/services/todo_service.py with create_todo function (validate user_id, insert into database)
- [ ] T081 Create backend/src/services/todo_service.py with get_todos function (filter by user_id, filter deleted_at IS NULL, paginate)
- [ ] T082 Create backend/src/services/todo_service.py with get_todo_by_id function (verify ownership before returning)
- [ ] T083 Create backend/src/services/todo_service.py with update_todo function (verify ownership before updating)
- [ ] T084 Create backend/src/services/todo_service.py with delete_todo function (soft delete by setting deleted_at, verify ownership)
- [ ] T085 Create backend/src/services/todo_service.py with toggle_todo_completion function (verify ownership before toggling)
- [ ] T086 [P] Create backend/src/api/routes/todos.py with GET /api/v1/todos endpoint (requires auth, filters by user_id)
- [ ] T087 [P] Create backend/src/api/routes/todos.py with POST /api/v1/todos endpoint (requires auth, creates todo for current user)
- [ ] T088 [P] Create backend/src/api/routes/todos.py with GET /api/v1/todos/{todo_id} endpoint (requires auth, verifies ownership)
- [ ] T089 [P] Create backend/src/api/routes/todos.py with PUT /api/v1/todos/{todo_id} endpoint (requires auth, verifies ownership)
- [ ] T090 [P] Create backend/src/api/routes/todos.py with DELETE /api/v1/todos/{todo_id} endpoint (requires auth, soft delete, verifies ownership)
- [ ] T091 [P] Create backend/src/api/routes/todos.py with PATCH /api/v1/todos/{todo_id}/toggle endpoint (requires auth, verifies ownership)
- [ ] T092 Register todo routes in backend/src/api/main.py
- [ ] T093 Test user isolation: create two users, add todos as User A, verify User B cannot access User A's todos
- [ ] T094 Test ownership checks: attempt to update/delete other user's todo, verify 403 or 404 returned

### Frontend Todo Integration (US2)

- [ ] T095 [P] Update frontend/src/components/todos/TodoList.tsx to fetch todos from new API
- [ ] T096 [P] Update frontend/src/components/todos/TodoItem.tsx to handle todo CRUD operations
- [ ] T097 [P] Update frontend/src/components/todos/TodoForm.tsx to create todos via new API
- [ ] T098 [P] Add loading states to todo components during API calls
- [ ] T099 [P] Add error handling for todo operations (display user-friendly messages)
- [ ] T100 Test create todo: enter title/description, verify appears in list
- [ ] T101 Test edit todo: change title, verify updates
- [ ] T102 Test toggle completion: mark complete, verify moves to completed section
- [ ] T103 Test delete: delete todo, verify removed from list

**Checkpoint**: Todo CRUD working with strict user data isolation - users can only access their own todos

---

## Phase 6: Session Management (User Story 3)

**Purpose**: Implement automatic token refresh and seamless session persistence

**Goal**: Users remain logged in across browser sessions with automatic token refresh

**Independent Test**: Login, close browser, reopen, verify still logged in without manual login

### TASK GROUP 7 — Session Persistence & Security (US3)

- [ ] T104 [P] Update frontend/src/lib/api-client.ts response interceptor to handle 401 errors with automatic token refresh
- [ ] T105 [P] Update frontend/src/lib/api-client.ts to store tokens in localStorage with access_token and refresh_token keys
- [ ] T106 [P] Add token refresh logic: on 401, call /api/v1/auth/refresh, store new tokens, retry original request
- [ ] T107 [P] Add redirect to login on refresh token expiry (401 after refresh attempt)
- [ ] T108 [P] Update frontend/src/app/(dashboard)/layout.tsx to check for existing access_token on mount
- [ ] T109 [P] Add useEffect hook to validate token on app load, redirect to /login if invalid
- [ ] T110 Test session persistence: login, close browser, reopen, verify dashboard loads without login
- [ ] T111 Test token refresh: change access token expiry to 10 seconds, wait, perform action, verify auto-refresh works
- [ ] T112 Test session expiry: let refresh token expire, verify redirect to login with "session expired" message

**Checkpoint**: Sessions persist across browser restarts, tokens refresh automatically, expiry handled gracefully

---

## Phase 7: UI Modernization (User Story 4)

**Purpose**: Transform UI to professional, neon-inspired SaaS design

**Goal**: Users interact with visually polished, modern interface with responsive design

**Independent Test**: Navigate landing, login, signup, dashboard - verify professional design, responsive on mobile, smooth transitions

### TASK GROUP 8 — Landing Page Redesign (US4)

- [ ] T113 [P] Update frontend/tailwind.config.ts with neon color palette (neon-cyan: #00f3ff, neon-magenta: #ff00ff, neon-purple: #bd00ff)
- [ ] T114 [P] Update frontend/tailwind.config.ts with dark theme colors (dark-bg: #0a0a0f, dark-surface: #12121a, dark-border: #1e1e2e)
- [ ] T115 [P] Add custom animations to tailwind.config.ts (fade-in, slide-up with 200-300ms duration)
- [ ] T116 [P] Update frontend/src/app/globals.css with neon-themed component classes (.btn-neon, .card-dark, .input-dark)
- [ ] T117 Redesign frontend/src/app/page.tsx landing page with hero section, gradient text, CTA buttons
- [ ] T118 Add feature cards to frontend/src/app/page.tsx (3-column grid: Lightning Fast, Secure by Default, Beautiful Design)
- [ ] T119 [P] Add icons to feature cards in frontend/src/app/page.tsx (use emoji or Lucide React icons)
- [ ] T120 Test landing page: verify professional design, gradient text, feature cards render properly
- [ ] T121 Test landing page responsiveness: verify 1 column mobile, 2 column tablet, 3 column desktop

### TASK GROUP 9 — Dashboard & Auth Screens UI Upgrade (US4)

- [ ] T122 [P] Redesign frontend/src/app/(auth)/login/page.tsx with centered card layout (max-width: 400px)
- [ ] T123 [P] Redesign frontend/src/app/(auth)/signup/page.tsx with centered card layout
- [ ] T124 [P] Update auth screens with dark theme backgrounds and neon accents
- [ ] T125 [P] Add smooth transitions to auth form components (fade-in, slide-up animations)
- [ ] T126 [P] Improve typography in frontend/src/app/(dashboard)/page.tsx (Inter font, clear hierarchy)
- [ ] T127 [P] Refine spacing in dashboard page (consistent 4px/8px grid system)
- [ ] T128 [P] Add status badges to todo items in frontend/src/components/todos/TodoItem.tsx (active/completed indicators)
- [ ] T129 [P] Add floating action button (FAB) for new todo in frontend/src/app/(dashboard)/page.tsx
- [ ] T130 [P] Add empty state illustration to frontend/src/components/todos/TodoList.tsx when no todos exist
- [ ] T131 [P] Add loading skeletons to todo components during data fetch
- [ ] T132 Test auth screens: verify centered layout, dark theme, smooth transitions
- [ ] T133 Test dashboard: verify refined layout, typography, spacing, FAB, empty state
- [ ] T134 Test responsiveness: verify all screens render properly on mobile (320px), tablet (768px), desktop (1920px)
- [ ] T135 Test transitions: verify smooth animations on page navigation and state changes

**Checkpoint**: UI transformed to professional SaaS-grade design with neon theme, responsive across all devices

---

## Phase 8: Final Verification & Sign-Off

**Purpose**: Comprehensive testing and validation before phase completion

### TASK GROUP 10 — Full App Regression Audit

- [ ] T136 Run complete auth flow test: signup → login → create todo → logout → login → verify todo exists
- [ ] T137 Run complete CRUD flow test: create → read → update → delete todos, verify all operations work
- [ ] T138 Run session management test: verify token refresh, session persistence, expiry handling
- [ ] T139 Run UI responsiveness test: test all screens on mobile, tablet, desktop viewports
- [ ] T140 Run security audit: verify all todo routes protected, user isolation enforced, ownership checks working
- [ ] T141 Run Supabase removal verification: `grep -r "supabase"` in frontend/src/ and backend/ should return empty
- [ ] T142 Run backend build test: verify backend starts without errors, all endpoints accessible
- [ ] T143 Run frontend build test: `npm run build` in frontend/, verify no build errors
- [ ] T144 Run production smoke test: test all user flows in production build locally

### TASK GROUP 11 — Phase II-N Closure

- [ ] T145 Verify zero Supabase references in code, env files, documentation
- [ ] T146 Verify Neon database accessible with all 3 tables and proper indexes
- [ ] T147 Verify BetterAuth working (JWT tokens, auth flows, user management)
- [ ] T148 Verify all 12 API endpoints functional per contracts/openapi.yaml
- [ ] T149 Verify UI modernized with neon theme, responsive design, smooth transitions
- [ ] T150 Verify no critical bugs (no 500 errors, no console errors, no broken flows)
- [ ] T151 Verify all P1 user stories (US1: Auth, US2: Todos, US5: Data Isolation) working end-to-end
- [ ] T152 Verify all P2 user stories (US3: Session Persistence, US4: UI Modernization) working end-to-end
- [ ] T153 Create git tag `phase2n-complete` to mark Phase II-N completion
- [ ] T154 Update CLAUDE.md or README.md documenting Phase II-N completion and new architecture
- [ ] T155 Update .specify/memory/constitution.md to lock Phase II-N as completed

**Checkpoint**: Phase II-N complete - Supabase removed, Neon + BetterAuth working, UI modernized, app stable and deployable

---

## Dependencies & Execution Order

### Task Group Dependencies

- **Task Group 1 (Agent Context)**: No dependencies - must be FIRST before any code changes
- **Task Group 2 (Supabase Removal)**: Depends on Task Group 1 - removes old stack before new stack
- **Task Group 3 (Neon Integration)**: Depends on Task Group 2 - establishes new database
- **Task Group 4 (Auth Backend)**: Depends on Task Group 3 - requires database schema
- **Task Group 5 (Auth Frontend)**: Depends on Task Group 4 - requires backend auth endpoints
- **Task Group 6 (Todo CRUD)**: Depends on Task Group 4 (requires auth) and Task Group 3 (requires database)
- **Task Group 7 (Session Management)**: Depends on Task Groups 4 and 5 (requires auth flow)
- **Task Group 8 (Landing Page)**: Can start in parallel with Task Group 4 (UI-only work)
- **Task Group 9 (Dashboard UI)**: Depends on Task Group 6 (requires todo components exist)
- **Task Group 10 (Regression Audit)**: Depends on ALL previous task groups
- **Task Group 11 (Phase Closure)**: Depends on Task Group 10 - final sign-off

### Within Each Task Group

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Backend tasks must complete before corresponding frontend tasks (API first, then integration)
- Models before services, services before routes
- Core implementation before validation/error handling
- Test after implementation

### Parallel Opportunities

**Task Group 1**: All agent documentation tasks (T002-T011) can run in parallel
**Task Group 2**: All audit tasks (T013-T017) can run in parallel
**Task Group 3**: Model creation (T037-T039) can run in parallel
**Task Group 4**: Auth schemas and deps (T049-T052) can run in parallel
**Task Group 5**: Auth form updates (T069-T076) can run in parallel
**Task Group 6**: Todo schemas (T079) and service functions (T080-T085) have internal dependencies
**Task Group 7**: All API client updates (T104-T109) can run in parallel
**Task Group 8**: Tailwind config (T113-T115) and globals.css (T116) can run in parallel
**Task Group 9**: All UI component updates (T122-T131) can run in parallel

---

## Parallel Example: Task Group 4 (Auth Backend)

```bash
# Launch all parallel tasks together:
Task: "Create backend/src/core/security.py with JWT token creation/validation functions"
Task: "Create backend/src/core/security.py with password hashing functions using bcrypt"
Task: "Create backend/src/schemas/auth.py with Pydantic schemas"
Task: "Create backend/src/api/deps.py with get_current_user dependency"
```

---

## Implementation Strategy

### Sequential MVP (Recommended)

1. **Complete Task Groups 1-3** (Agent Context → Supabase Removal → Neon Setup)
2. **Complete Task Group 4** (Auth Backend)
3. **Complete Task Group 5** (Auth Frontend)
4. **STOP and VALIDATE**: Test complete auth flow (signup, login, logout)
5. **Complete Task Group 6** (Todo CRUD)
6. **STOP and VALIDATE**: Test todo operations and user isolation
7. **Complete Task Group 7** (Session Management)
8. **STOP and VALIDATE**: Test token refresh and session persistence
9. **Complete Task Groups 8-9** (UI Modernization)
10. **STOP and VALIDATE**: Test all screens for responsiveness and visual polish
11. **Complete Task Groups 10-11** (Final Audit & Closure)

### Accelerated (With Parallel Execution)

1. **Complete Task Groups 1-3** (must be sequential)
2. Once Task Group 3 complete:
   - **Team A**: Task Group 4 (Auth Backend)
   - **Team B**: Task Group 8 (Landing Page UI - can start early)
3. Once Task Group 4 complete:
   - **Team A**: Task Group 5 (Auth Frontend)
   - **Team B**: Task Group 6 (Todo CRUD)
4. Once Task Groups 5-6 complete: Task Group 7 (Session Management)
5. Once backend complete: Task Groups 8-9 (UI Modernization) can run in parallel
6. Final: Task Groups 10-11 (Audit & Closure)

---

## Notes

- **[P] tasks**: Different files, no blocking dependencies - can run in parallel if team capacity allows
- **Task Groups**: Organized by the 8-step migration strategy, each group completes before next begins
- **User Stories**: Mapped to task groups (US1=Groups 4-5, US2=Group 6, US3=Group 7, US4=Groups 8-9, US5=Group 6)
- **Validation Gates**: Each task group has checkpoint - verify before proceeding
- **Git Strategy**: Commit after each task group completion with descriptive message
- **Rollback Plan**: Each task group is independently revertible if critical issues found
- **Quality Focus**: No "vibe coding" - all tasks tied to specific requirements from spec/plan

---

**Total Tasks**: 155
**Task Groups**: 11
**Estimated Time**: 4-6 hours (assuming sequential execution, less with parallel teams)
**Critical Path**: Task Groups 1 → 2 → 3 → 4 → 5 → 6 → 7 → 10 → 11 (Groups 8-9 can run in parallel with 4-7)

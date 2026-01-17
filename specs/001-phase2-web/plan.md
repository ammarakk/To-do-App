# Implementation Plan: Phase 2 - Multi-User Web Application

**Branch**: `001-phase2-web` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phase2-web/spec.md`

**Note**: This plan defines WHAT happens and WHEN, following strict Spec-Driven Development and prompts-only execution.

## Summary

Transform the Phase 1 console-based Todo application into a production-grade, multi-user web application with secure authentication, persistent database storage, and a professional responsive UI. The implementation follows a sequential 5-phase approach: Backend Foundation → Auth & Database → Frontend UI → Integration → Validation & Quality Gates. All work is executed via system prompts and agent prompts—no manual coding.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5+ (frontend)
**Primary Dependencies**: FastAPI (backend), Next.js 16+ (frontend), Supabase PostgreSQL + Auth (database/auth), supabase-py (backend client), @supabase/supabase-js (frontend client)
**Storage**: Supabase PostgreSQL with Row Level Security (RLS)
**Testing**: pytest with FastAPI TestClient (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web browser (desktop, tablet, mobile)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: Todo list load < 2s for 100 items, search/filter < 1s, account creation < 1 min
**Constraints**: All API requests must validate JWT, strict user data isolation, no shared/public todos, all responses < 2s (p95)
**Scale/Scope**: Support multiple concurrent users, each with up to 1000+ todos, paginated at 20 items per page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Evaluation

| Principle | Status | Notes |
|-----------|--------|-------|
| **Prompt-Only Development** | ✅ PASS | All implementation will use system/agent prompts—no manual coding |
| **Spec-Driven Development** | ✅ PASS | Following Specify → Plan → Tasks → Implement workflow |
| **Mandatory Technology Stack** | ✅ PASS | Backend: Python 3.13+ + FastAPI, Frontend: Next.js 16+ + TypeScript + Tailwind, Database/Auth: Supabase PostgreSQL + Supabase Auth |
| **Project Phase Compliance** | ✅ PASS | Phase II scope: web app with auth and CRUD—no AI, no Kubernetes, no cloud automation |
| **Architecture of Intelligence** | ✅ PASS | Reusable skills will be created for CRUD, validation, auth, state management |
| **Operational Constraints** | ✅ PASS | No vibe coding—all implementations traceable to Task IDs, all routes enforce user isolation, RLS enabled |

### Post-Design Gate (Re-evaluate after Phase 1)

*To be completed after data-model.md and contracts/ are generated*

## Project Structure

### Documentation (this feature)

```text
specs/001-phase2-web/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file - implementation plan (IN PROGRESS)
├── research.md          # Phase 0 output - research findings (TO BE CREATED)
├── data-model.md        # Phase 1 output - database schema (TO BE CREATED)
├── quickstart.md        # Phase 1 output - dev setup guide (TO BE CREATED)
├── contracts/           # Phase 1 output - API contracts (TO BE CREATED)
│   └── openapi.yaml     # OpenAPI 3.0 spec for FastAPI endpoints
└── tasks.md             # Phase 2 output - implementation tasks (TO BE CREATED via /sp.tasks)
```

### Source Code (repository root)

```text
to-do-app/
├── backend/                         # Phase 2 FastAPI backend
│   ├── src/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py              # FastAPI dependencies (JWT verification)
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py          # Auth endpoints (login, signup - handled by Supabase)
│   │   │       └── todos.py         # Todo CRUD endpoints
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── schemas.py           # Pydantic models for request/response
│   │   │   └── database.py          # Supabase client configuration
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py      # JWT validation & user extraction
│   │   │   └── todo_service.py      # Todo business logic
│   │   ├── main.py                  # FastAPI application entry point
│   │   └── config.py                # Environment configuration
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py              # Pytest fixtures
│   │   ├── contract/                # API contract tests
│   │   ├── integration/             # Integration tests with Supabase
│   │   └── unit/                    # Unit tests for services
│   ├── pyproject.toml               # Python project config (uv)
│   └── .env.example                 # Environment variables template
│
├── frontend/                        # Phase 2 Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout with auth provider
│   │   │   ├── page.tsx             # Landing/home page
│   │   │   ├── (auth)/              # Auth route group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx     # Login page
│   │   │   │   └── signup/
│   │   │   │       └── page.tsx     # Signup page
│   │   │   ├── (dashboard)/         # Protected route group
│   │   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   │   └── todos/
│   │   │   │       └── page.tsx     # Todo list page
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components (buttons, inputs, etc.)
│   │   │   ├── auth/                # Auth-specific components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   └── todos/               # Todo-specific components
│   │   │       ├── TodoList.tsx
│   │   │       ├── TodoItem.tsx
│   │   │       ├── TodoForm.tsx
│   │   │       ├── FilterBar.tsx
│   │   │       └── Pagination.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts          # Supabase client configuration
│   │   │   ├── api.ts               # API client functions
│   │   │   └── types.ts             # TypeScript type definitions
│   │   └── styles/
│   │       └── globals.css          # Global styles with Tailwind directives
│   ├── tests/
│   │   ├── __mocks__/
│   │   ├── unit/                    # Component unit tests
│   │   └── integration/             # Integration tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local.example           # Environment variables template
│
├── src/                             # Phase 1 console app (LOCKED - NO CHANGES)
├── .specify/                        # SpecKit Plus configuration
├── specs/                           # All feature specifications
└── docs/                            # Additional documentation
```

**Structure Decision**: Web application structure with separate `backend/` and `frontend/` directories. Backend follows FastAPI best practices with layered architecture (api → services → models). Frontend follows Next.js 16+ App Router conventions with route groups for auth and protected routes. This separation enables independent deployment and scaling.

## Execution Phases

### Phase 2.1 — Backend Foundation (Sequential, No Parallel Work)

**Objective**: Establish FastAPI project structure with clear API boundaries, request/response schemas, error handling, and JWT verification flow—without database access.

**Deliverables**:
- FastAPI project initialized with `uv` package manager
- Project structure created (`backend/src/` hierarchy)
- Pydantic schemas defined for all request/response models
- FastAPI dependencies configured for JWT extraction
- Error handling middleware implemented
- CORS middleware configured for frontend communication
- Health check endpoint implemented

**Key Activities**:
1. Initialize Python 3.13+ project with `uv`
2. Create `backend/` directory structure
3. Define Pydantic models:
   - `TodoCreate`, `TodoUpdate`, `TodoResponse` schemas
   - `UserResponse` schema
   - Error response schemas
4. Configure FastAPI dependencies in `deps.py`:
   - `get_current_user()` dependency to extract and validate JWT from Authorization header
5. Implement error handling middleware:
   - Custom exception handlers for 401, 403, 404, 422, 500 errors
   - Standardized error response format
6. Configure CORS middleware to allow frontend origin
7. Create placeholder routes with authentication guards
8. Add health check endpoint at `GET /`

**Success Criteria**:
- FastAPI application starts without errors
- Health check endpoint returns 200 OK
- JWT extraction logic correctly decodes Supabase tokens (validation without DB yet)
- All endpoints return 401 Unauthorized when JWT is missing
- Error handlers return consistent JSON error responses

**Agent Usage**: Agents will be defined in `/sp.tasks` stage for:
- FastAPI project initialization
- Pydantic schema generation
- Middleware setup

---

### Phase 2.2 — Auth & Database (Sequential, Depends on Phase 2.1)

**Objective**: Configure Supabase project, define PostgreSQL schema with RLS, connect FastAPI to Supabase, validate JWT tokens, and enforce user isolation at both API and database levels.

**Deliverables**:
- Supabase project configured and credentials stored in `.env`
- PostgreSQL schema defined (users table via Supabase Auth, todos table)
- Row Level Security (RLS) policies enabled and enforced
- Supabase Python client configured in FastAPI
- JWT validation integrated with Supabase Auth
- User isolation enforced in all todo operations

**Key Activities**:
1. **Supabase Project Setup**:
   - Create Supabase project (if not exists)
   - Enable Email Auth provider
   - Generate API keys (anon, service_role)
   - Configure environment variables in `backend/.env`

2. **Database Schema**:
   - `todos` table:
     - `id`: UUID (primary key, default uuid_generate_v4())
     - `user_id`: UUID (foreign key to auth.users, NOT NULL)
     - `title`: TEXT (NOT NULL)
     - `description`: TEXT (nullable)
     - `is_completed`: BOOLEAN (default false)
     - `priority`: TEXT (check: 'low', 'medium', 'high', default 'medium')
     - `due_date`: TIMESTAMPTZ (nullable)
     - `category`: TEXT (nullable)
     - `created_at`: TIMESTAMPTZ (default now())
     - `updated_at`: TIMESTAMPTZ (default now())
   - Indexes on `user_id`, `is_completed`, `priority`, `due_date`

3. **Row Level Security (RLS)**:
   - Enable RLS on `todos` table
   - Policy: Users can SELECT only their own todos
   - Policy: Users can INSERT only their own todos (user_id must match auth.uid())
   - Policy: Users can UPDATE only their own todos
   - Policy: Users can DELETE only their own todos

4. **FastAPI-Supabase Integration**:
   - Configure `supabase-py` client in `models/database.py`
   - Update `deps.py` to verify JWT with Supabase
   - Implement `auth_service.py`:
     - `verify_jwt(token)` function validates with Supabase
     - `get_user_from_token(token)` extracts user_id and email
   - Implement `todo_service.py`:
     - All queries include `user_id` filter (defense in depth)
     - CRUD operations using Supabase client

5. **API Endpoints** (implemented, tested):
   - `POST /api/auth/signup` - Create user via Supabase Auth
   - `POST /api/auth/login` - Authenticate via Supabase Auth
   - `POST /api/auth/logout` - Invalidate session
   - `GET /api/todos` - List user's todos with pagination
   - `POST /api/todos` - Create new todo
   - `GET /api/todos/{id}` - Get specific todo
   - `PUT /api/todos/{id}` - Update todo
   - `DELETE /api/todos/{id}` - Delete todo

**Success Criteria**:
- Supabase connection successful
- Users can sign up and log in via Supabase Auth
- JWT tokens correctly validated on every request
- Users can only CRUD their own todos (enforced by RLS + API)
- Direct database queries respect RLS policies
- All API endpoints return proper error responses for unauthorized access

**Agent Usage**: Agents will be defined in `/sp.tasks` stage for:
- Supabase project configuration
- SQL schema generation and RLS policy creation
- Supabase client integration
- JWT validation implementation

---

### Phase 2.3 — Frontend UI (Sequential, Depends on Phase 2.2)

**Objective**: Setup Next.js 16+ App Router structure, configure Tailwind CSS, create auth pages (login/signup), build dashboard layout, implement Todo UI components, and ensure responsive design—without backend assumptions (use mocks initially).

**Deliverables**:
- Next.js 16+ project initialized with TypeScript
- Tailwind CSS configured with mobile-first responsive design
- Auth pages (login, signup) with form validation
- Dashboard layout with navigation
- Todo UI components (list, form, filters, pagination)
- Responsive design working on desktop, tablet, mobile
- Loading states and empty states implemented
- Mock data for initial development

**Key Activities**:
1. **Project Initialization**:
   - Create Next.js 16+ app with `create-next-app`
   - Configure TypeScript strict mode
   - Setup Tailwind CSS with custom theme
   - Create `frontend/src/` directory structure

2. **Supabase Client Setup**:
   - Install `@supabase/supabase-js`
   - Create `lib/supabase.ts` client configuration
   - Configure environment variables in `.env.local`

3. **Auth Pages**:
   - Create `app/(auth)/login/page.tsx` with login form
   - Create `app/(auth)/signup/page.tsx` with signup form
   - Implement client-side form validation
   - Integrate Supabase Auth methods (`signInWithPassword`, `signUp`)
   - Add error message display
   - Mock auth flow initially (before backend integration)

4. **Dashboard Layout**:
   - Create `app/(dashboard)/layout.tsx` with auth guard
   - Implement navigation header with logout button
   - Responsive sidebar (desktop) / bottom nav (mobile)

5. **Todo Components**:
   - `TodoList.tsx` - Display paginated list of todos
   - `TodoItem.tsx` - Individual todo display with edit/delete actions
   - `TodoForm.tsx` - Create/edit form with all fields
   - `FilterBar.tsx` - Search, filter by priority/status/category
   - `Pagination.tsx` - Page navigation controls
   - Loading indicators (skeletons, spinners)
   - Empty state messages

6. **State Management**:
   - React hooks for local state (useState, useReducer)
   - Custom hooks for todo operations (useTodos, useCreateTodo, etc.)
   - Mock API responses initially

7. **Responsive Design**:
   - Mobile-first Tailwind breakpoints (sm, md, lg, xl)
   - Touch-friendly button sizes on mobile
   - Adaptive layouts (stack on mobile, grid on desktop)

**Success Criteria**:
- Next.js application runs without errors
- All pages render correctly on mobile, tablet, desktop
- Forms validate user input and show errors
- Mock auth flow works (login → redirect to dashboard)
- Todo components display mock data correctly
- Loading and empty states display appropriately
- Tailwind styles apply correctly across all components

**Agent Usage**: Agents will be defined in `/sp.tasks` stage for:
- Next.js project setup
- Component generation
- Tailwind styling implementation

---

### Phase 2.4 — Integration (Sequential, Depends on Phases 2.2 & 2.3)

**Objective**: Connect frontend to FastAPI backend APIs, pass JWT securely through Supabase Auth, handle loading and error states, and ensure full CRUD functionality works end-to-end.

**Deliverables**:
- Frontend API client configured to communicate with FastAPI
- Supabase Auth integrated with frontend (real auth, not mocks)
- JWT tokens passed securely in API requests
- All CRUD operations functional (create, read, update, delete)
- Search and filter operations working
- Pagination working
- Error handling for all failure scenarios
- Loading states for all async operations

**Key Activities**:
1. **API Client Setup**:
   - Create `lib/api.ts` with typed API functions
   - Configure axios or fetch for HTTP requests
   - Add JWT injection middleware (attach Authorization header)
   - Handle API errors globally

2. **Replace Mocks with Real APIs**:
   - Update auth pages to use real Supabase Auth
   - Update todo components to call FastAPI endpoints
   - Remove mock data and use real API responses

3. **JWT Flow**:
   - On login: Store Supabase JWT in localStorage/state
   - On API calls: Attach JWT to Authorization header
   - On 401 errors: Redirect to login
   - On logout: Clear JWT and redirect

4. **Error Handling**:
   - Network errors: Show user-friendly message
   - Validation errors: Display field-specific errors
   - Auth errors: Redirect to login with message
   - 500 errors: Show generic error message

5. **Loading States**:
   - Show skeleton loaders while fetching
   - Disable buttons during form submission
   - Show progress indicators for long operations

6. **End-to-End Testing**:
   - Test complete user flows:
     - Sign up → Create todo → Edit todo → Delete todo → Logout
     - Login → View todos → Filter → Search → Paginate → Logout
   - Verify user isolation (User A cannot see User B's todos)

**Success Criteria**:
- All CRUD operations work without errors
- Auth flow works end-to-end (signup/login/logout)
- JWT passed correctly on all API requests
- Users see only their own todos
- Search, filter, and pagination work correctly
- All error scenarios handled gracefully
- Loading states display for all async operations
- Application works on mobile and desktop

**Agent Usage**: Agents will be defined in `/sp.tasks` stage for:
- API client implementation
- Integration testing
- Error handling implementation

---

### Phase 2.5 — Validation & Quality Gates (Sequential, Depends on Phase 2.4)

**Objective**: Validate all functionality through comprehensive testing, ensure security requirements are met, verify UI responsiveness, and confirm no console or runtime errors.

**Deliverables**:
- Comprehensive test suite for backend (pytest)
- Comprehensive test suite for frontend (Jest + React Testing Library)
- Security validation report
- UI responsiveness validation report
- Performance benchmark report
- All quality gates passed

**Key Activities**:
1. **Backend Testing**:
   - Unit tests for all service functions
   - Integration tests for all API endpoints
   - Contract tests verifying request/response schemas
   - Security tests for user isolation
   - Performance tests (load testing for 100+ todos)

2. **Frontend Testing**:
   - Unit tests for all components
   - Integration tests for user flows
   - Accessibility tests (a11y)
   - Visual regression tests (responsive breakpoints)

3. **Security Testing**:
   - Verify user isolation enforced at API and DB levels
   - Test URL manipulation attempts (accessing other users' todos)
   - Verify JWT validation on all endpoints
   - Verify RLS policies in Supabase

4. **UI Responsiveness Testing**:
   - Manual testing on mobile, tablet, desktop
   - Verify all features work on all screen sizes
   - Check touch interactions on mobile
   - Verify layouts adapt correctly

5. **Error Handling Testing**:
   - Network failures
   - Invalid credentials
   - Malformed requests
   - Session expiration

6. **Performance Testing**:
   - Todo list load time < 2s for 100 items
   - Search/filter response < 1s
   - Account creation < 1 min
   - Todo creation < 30s

**Quality Gates** (MUST PASS for Phase 2 completion):

| Gate | Criteria | Status |
|------|----------|--------|
| **Auth Flow** | Users can sign up, log in, log out successfully | ⬜ NOT TESTED |
| **CRUD Operations** | Create, read, update, delete todos without errors | ⬜ NOT TESTED |
| **User Isolation** | Users cannot access other users' data (verified via security tests) | ⬜ NOT TESTED |
| **UI Responsiveness** | Application functional on mobile, tablet, desktop | ⬜ NOT TESTED |
| **Error Handling** | All error scenarios handled with clear messages | ⬜ NOT TESTED |
| **Performance** | All SC metrics met (load times, response times) | ⬜ NOT TESTED |
| **No Runtime Errors** | Zero console errors during normal operations | ⬜ NOT TESTED |

**Success Criteria**:
- All quality gates passed
- 100% of functional requirements satisfied
- All success criteria from spec.md met
- Zero critical bugs
- Test coverage ≥ 80% (both backend and frontend)

**Agent Usage**: Agents will be defined in `/sp.tasks` stage for:
- Test generation and execution
- Security testing
- Performance benchmarking

---

## Dependencies & Integration Points

### External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.13+ | Backend runtime |
| **FastAPI** | Latest | Backend API framework |
| **supabase-py** | Latest | Supabase Python client |
| **Pydantic** | Latest | Data validation |
| **uvicorn** | Latest | ASGI server |
| **pytest** | Latest | Backend testing |
| **Node.js** | Latest LTS | Frontend runtime |
| **Next.js** | 16+ | Frontend framework |
| **TypeScript** | 5+ | Frontend type safety |
| **Tailwind CSS** | 3+ | Styling |
| **@supabase/supabase-js** | Latest | Supabase JS client |
| **Jest** | Latest | Frontend testing |
| **React Testing Library** | Latest | Component testing |

### Internal Dependencies

- **Phase 2.1 (Backend Foundation)** must complete before **Phase 2.2 (Auth & Database)**
- **Phase 2.2 (Auth & Database)** must complete before **Phase 2.3 (Frontend UI)** can integrate with real backend
- **Phase 2.3 (Frontend UI)** can start in parallel with **Phase 2.2** using mocks (BUT user specified NO parallel execution)
- **Phase 2.4 (Integration)** requires both **Phase 2.2** and **Phase 2.3** to be complete
- **Phase 2.5 (Validation)** requires **Phase 2.4** to be complete

### API Contracts (Generated in Phase 1)

See `contracts/openapi.yaml` for detailed API specifications including:
- All endpoints, methods, paths, parameters
- Request body schemas
- Response schemas
- Error response formats
- Authentication requirements

---

## Risk Analysis & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| **Supabase RLS misconfiguration** | HIGH (data leak) | MEDIUM | Thorough security testing in Phase 2.5, manual review of RLS policies |
| **JWT validation bypass** | CRITICAL (auth breach) | LOW | Use Supabase's built-in JWT verification, defense in depth (API + DB) |
| **Performance degradation with large datasets** | MEDIUM (UX impact) | MEDIUM | Implement pagination from start, add database indexes, benchmark in Phase 2.5 |
| **Frontend-backend integration issues** | MEDIUM (delay) | MEDIUM | Use OpenAPI spec for contract testing, mock APIs during frontend development |
| **Mobile UI usability issues** | LOW (UX impact) | LOW | Responsive design from start, manual testing on real devices in Phase 2.5 |
| **Session expiration handling** | MEDIUM (UX impact) | MEDIUM | Implement refresh token logic, clear error messages, auto-redirect to login |

---

## Complexity Tracking

> **No violations to justify** - All design decisions align with constitution and Phase 2 scope.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Next Steps

1. **Phase 0: Research** - Run research agents to validate technology choices and best practices
2. **Phase 1: Design** - Generate `data-model.md`, `contracts/openapi.yaml`, and `quickstart.md`
3. **Phase 2: Tasks** - Execute `/sp.tasks` to create detailed implementation tasks
4. **Phase 3: Implement** - Execute `/sp.implement` to follow tasks and build the system

---

**Plan Status**: ✅ COMPLETE - Ready for Phase 0 Research and Phase 1 Design

**Constitution Compliance**: ✅ PASS - All principles and constraints satisfied

# Research Findings: Phase 2 - Multi-User Web Application

**Feature**: 001-phase2-web
**Date**: 2026-01-17
**Status**: Complete

## Overview

This document consolidates research findings for Phase 2 implementation, validating technology choices and documenting best practices for FastAPI, Supabase, Next.js, and integration patterns.

---

## 1. FastAPI Best Practices for Multi-User Applications

### Decision: Use FastAPI with Pydantic v2 for type-safe API development

**Rationale**:
- Native async/await support for high-performance I/O operations
- Automatic OpenAPI documentation generation
- Pydantic v2 provides significant performance improvements (~5-50x faster)
- Built-in request validation and serialization
- Excellent TypeScript schema generation support

**Alternatives Considered**:
- **Flask**: Rejected due to lack of native async support and manual validation required
- **Django**: Rejected due to heavyweight nature and monolithic structure (overkill for CRUD API)
- **Express.js**: Rejected per constitution (must use Python backend)

**Best Practices**:
1. **Dependency Injection System**: Use FastAPI's `Depends()` for auth checks, DB sessions, and shared logic
2. **APIRouter**: Organize routes into separate routers (`auth.py`, `todos.py`) for maintainability
3. **Exception Handlers**: Register custom exception handlers globally for consistent error responses
4. **CORS Middleware**: Configure specific origins in production, wildcard in development only
5. **Pydantic Schemas**: Separate request (`TodoCreate`) and response (`TodoResponse`) models for clarity
6. **JWT Validation**: Create reusable `get_current_user()` dependency for protected routes

**Reference**: [FastAPI Documentation - User Guide](https://fastapi.tiangolo.com/tutorial/)

---

## 2. Supabase Integration Patterns

### Decision: Use Supabase Auth + PostgreSQL with RLS for multi-tenant data isolation

**Rationale**:
- **Supabase Auth**: Provides OAuth, email/password, and magic link auth out of the box
- **PostgreSQL**: Industry-standard relational database with ACID guarantees
- **Row Level Security (RLS)**: Database-level enforcement of user isolation (defense in depth)
- **Supabase Client Libraries**: Official Python (`supabase-py`) and JavaScript (`@supabase/supabase-js`) clients
- **Real-time Capabilities**: Built-in WebSocket support for future enhancements

**Alternatives Considered**:
- **Neon DB**: Rejected per constitution (must use Supabase only)
- **Custom JWT implementation**: Rejected due to security risks and maintenance burden
- **Prisma ORM**: Rejected to avoid additional abstraction layer (direct SQL via Supabase client)

**Best Practices**:
1. **JWT Verification**:
   - Backend: Use `supabase-py` with `JWT_SECRET` environment variable
   - Frontend: Use `@supabase/supabase-js` which handles token storage and refresh automatically
   - Always validate JWT on every protected endpoint (no exceptions)

2. **Row Level Security (RLS) Policies**:
   ```sql
   -- Enable RLS
   ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can only see their own todos
   CREATE POLICY "Users can view own todos"
   ON todos FOR SELECT
   USING (auth.uid() = user_id);

   -- Policy: Users can only insert their own todos
   CREATE POLICY "Users can insert own todos"
   ON todos FOR INSERT
   WITH CHECK (auth.uid() = user_id);

   -- Policy: Users can only update their own todos
   CREATE POLICY "Users can update own todos"
   ON todos FOR UPDATE
   USING (auth.uid() = user_id);

   -- Policy: Users can only delete their own todos
   CREATE POLICY "Users can delete own todos"
   ON todos FOR DELETE
   USING (auth.uid() = user_id);
   ```

3. **Defense in Depth**:
   - API layer: Always filter by `user_id` in queries (even though RLS handles it)
   - Database layer: RLS policies prevent unauthorized access even if API is compromised
   - Never trust client-side `user_id`—always extract from JWT

4. **Environment Variables** (never commit secrets):
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Backend only, never expose to frontend
   ```

**Reference**: [Supabase Documentation - Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 3. Next.js 16+ App Router Architecture

### Decision: Use Next.js 16+ App Router with Route Groups for auth and protected routes

**Rationale**:
- **App Router**: Latest Next.js architecture with built-in layouts, error boundaries, and loading states
- **Route Groups**: `(auth)` and `(dashboard)` groups for logical organization without affecting URL structure
- **Server Components**: Reduced client-side JavaScript, improved performance
- **TypeScript**: Full type safety from server to client
- **Tailwind CSS**: Utility-first CSS with excellent DX and small bundle size

**Alternatives Considered**:
- **Pages Router**: Rejected (constitution mandates App Router only)
- **React Router**: Rejected (constitution mandates Next.js)
- **CSS Modules / Styled Components**: Rejected per constitution (must use Tailwind)

**Best Practices**:
1. **Route Group Structure**:
   ```
   app/
   ├── (auth)/           # Auth routes (login, signup)
   │   ├── login/
   │   └── signup/
   ├── (dashboard)/     # Protected routes (require auth)
   │   ├── layout.tsx   # Auth guard middleware
   │   └── todos/
   └── layout.tsx       # Root layout
   ```

2. **Auth Guard Implementation**:
   - Middleware: Use `next middleware.ts` to redirect unauthenticated users
   - Server Components: Check session server-side before rendering
   - Client Components: Use Supabase auth state listener for reactive UI updates

3. **State Management**:
   - **Local State**: `useState` / `useReducer` for component-specific state
   - **Server State**: Fetch data in Server Components when possible
   - **Global State**: Supabase client handles auth state automatically
   - **Avoid**: Redux/Zustand (overkill for this app size)

4. **Responsive Design with Tailwind**:
   - Mobile-first approach: `class="md:grid-cols-3 lg:grid-cols-4"`
   - Touch targets: Minimum 44x44 pixels on mobile
   - Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

**Reference**: [Next.js App Router Documentation](https://nextjs.org/docs/app)

---

## 4. JWT Flow: Supabase Auth → FastAPI → Next.js

### Decision: Use Supabase JWT tokens passed via Authorization header

**Rationale**:
- **Supabase Auth**: Handles user creation, login, token generation, and refresh automatically
- **JWT Format**: Standard RFC 7519 tokens signed by Supabase
- **Authorization Header**: Industry-standard `Bearer <token>` format
- **Token Storage**: Supabase JS client handles localStorage and token refresh

**Flow Diagram**:
```
1. User submits login form (email + password)
   ↓
2. Frontend: supabase.auth.signInWithPassword()
   ↓
3. Supabase returns JWT (access_token + refresh_token)
   ↓
4. Frontend stores tokens (handled by @supabase/supabase-js)
   ↓
5. Frontend makes API request: Authorization: Bearer <jwt>
   ↓
6. FastAPI: extract token from header → verify with Supabase
   ↓
7. FastAPI: extract user_id from JWT → pass to service layer
   ↓
8. Service: query database with user_id filter
   ↓
9. PostgreSQL RLS: enforces user_id = auth.uid()
   ↓
10. Return data to frontend
```

**Best Practices**:
1. **Token Validation** (Backend):
   ```python
   from supabase import Client, create_client

   def verify_jwt(token: str) -> dict:
       client = create_client(SUPABASE_URL, SUPABASE_JWT_SECRET)
       try:
           return client.auth.get_user(token)
       except Exception as e:
           raise HTTPException(status_code=401, detail="Invalid token")
   ```

2. **Token Injection** (Frontend):
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

   // Supabase automatically attaches auth header to requests
   const { data } = await supabase
     .from('todos')
     .select('*')
   ```

3. **Token Refresh**:
   - Supabase JS client handles refresh automatically
   - Backend checks token expiry on every request
   - Redirect to login on 401 Unauthorized

---

## 5. Error Handling & User Feedback Patterns

### Decision: Standardized error response format + user-friendly messages

**Rationale**:
- **Consistency**: All errors follow same structure for frontend handling
- **Security**: Never leak sensitive information (passwords, stack traces) in error responses
- **Usability**: Clear, actionable error messages guide users to resolution

**Error Response Schema**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly error message",
    "details": ["Field-specific error 1", "Field-specific error 2"]
  }
}
```

**Error Types**:
- **400 Bad Request**: Invalid input (validation errors)
- **401 Unauthorized**: Missing or invalid JWT
- **403 Forbidden**: Valid JWT but insufficient permissions (user trying to access another user's data)
- **404 Not Found**: Resource doesn't exist or doesn't belong to user
- **422 Unprocessable Entity**: Semantic validation errors (e.g., past due date)
- **500 Internal Server Error**: Unexpected server error (log these, don't expose details)

**Loading States Pattern**:
- **Initial Load**: Skeleton screens (better UX than spinners)
- **Action Feedback**: Disable buttons during async operations (prevent double-submit)
- **Empty States**: Friendly message + call-to-action when no data exists

---

## 6. Performance Optimization Strategies

### Decision: Pagination + database indexes + optimized queries from day one

**Rationale**:
- **Pagination**: Limit queries to 20 items per page (configurable)
- **Indexes**: Add indexes on `user_id`, `is_completed`, `priority`, `due_date`
- **Query Optimization**: Select only required fields (avoid `SELECT *`)
- **Caching**: Consider caching frequently accessed data (user profile) in future

**Pagination Strategy**:
- **Backend**: `OFFSET` and `LIMIT` in SQL queries
- **Frontend**: Pagination component with page numbers
- **URL State**: Store page number in query params (`?page=2`)

**Database Indexes**:
```sql
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_user_completed ON todos(user_id, is_completed);
CREATE INDEX idx_todos_priority ON todos(user_id, priority);
CREATE INDEX idx_todos_due_date ON todos(user_id, due_date);
```

**Performance Targets** (from spec):
- Todo list load: < 2s for 100 items
- Search/filter response: < 1s
- Account creation: < 1 min
- Todo creation: < 30s

---

## 7. Testing Strategy

### Decision: Multi-layer testing approach (unit → integration → contract → e2e)

**Rationale**:
- **Unit Tests**: Fast feedback on business logic (services, utilities)
- **Integration Tests**: Verify API endpoints work with Supabase
- **Contract Tests**: Ensure API matches OpenAPI spec
- **E2E Tests**: Validate critical user flows (signup → create todo → delete)
- **Coverage Target**: ≥80% for both backend and frontend

**Backend Testing (pytest)**:
```python
# Unit test example
def test_todo_service_filters_by_user_id(db_session):
    user1_id = "user-1"
    user2_id = "user-2"
    create_todo(db_session, user1_id, "Todo 1")
    create_todo(db_session, user2_id, "Todo 2")

    todos = get_todos(db_session, user1_id)

    assert len(todos) == 1
    assert todos[0].title == "Todo 1"

# Integration test example
def test_api_get_todos_requires_auth(test_client):
    response = test_client.get("/api/todos")
    assert response.status_code == 401
```

**Frontend Testing (Jest + React Testing Library)**:
```typescript
// Component test example
test('TodoList displays loading state', () => {
  render(<TodoList isLoading />)
  expect(screen.getByTestId('todo-list-skeleton')).toBeInTheDocument()
})

test('TodoList displays todos', async () => {
  render(<TodoList todos={mockTodos} />)
  expect(screen.getByText('Buy groceries')).toBeInTheDocument()
})
```

**Security Testing**:
- Verify RLS policies prevent cross-user data access
- Test JWT validation (missing, expired, invalid tokens)
- Attempt URL manipulation to access other users' todos

---

## 8. Security Hardening Checklist

### Decision: Multi-layer security approach (JWT + RLS + input validation + HTTPS)

**Security Measures**:
1. **JWT Validation**: Verify token signature and expiry on every request
2. **Row Level Security**: Enable RLS on all user-owned tables
3. **Input Validation**: Validate all inputs with Pydantic schemas
4. **SQL Injection Prevention**: Use parameterized queries (Supabase client handles this)
5. **CORS**: Configure specific allowed origins (no wildcard in production)
6. **HTTPS Only**: Force HTTPS in production (redirect HTTP to HTTPS)
7. **Rate Limiting**: Consider rate limiting auth endpoints (prevent brute force)
8. **Password Security**: Supabase handles password hashing (bcrypt)
9. **Environment Variables**: Never commit secrets (use `.env` files)
10. **Error Messages**: Don't leak sensitive info (e.g., "User exists" vs "Invalid email")

**CORS Configuration**:
```python
# Development
allow_origins=["http://localhost:3000"]

# Production
allow_origins=["https://your-frontend-domain.vercel.app"]
```

---

## 9. Deployment Architecture

### Decision: Deploy backend to Railway/Render + frontend to Vercel

**Rationale**:
- **Vercel**: Official Next.js deployment platform with zero-config setup
- **Railway/Render**: Simple Python/FastAPI deployment with managed databases
- **Environment Variables**: Configure separately for each environment
- **Monorepo**: Keep backend and frontend in same repo for simplicity

**Alternatives Considered**:
- **Docker + Kubernetes**: Rejected (constitution reserves this for Phase 4)
- **AWS/GCP/Azure**: Rejected (overkill for MVP, higher complexity)
- **Heroku**: Rejected (no longer has free tier)

**Deployment Checklist**:
1. Backend:
   - Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` environment variables
   - Run database migrations (create tables, enable RLS)
   - Configure CORS to allow frontend origin
   - Enable health check endpoint for load balancer

2. Frontend:
   - Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables
   - Set `NEXT_PUBLIC_API_URL` (backend URL)
   - Configure production domain in Vercel

3. Database:
   - Run Supabase migrations to create schema
   - Enable RLS policies
   - Create database indexes

---

## 10. Technology Version Lock

**Final Technology Stack** (locked per constitution):

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Python** | 3.13+ | Latest stable with performance improvements |
| **FastAPI** | Latest | Active maintenance, frequent updates |
| **supabase-py** | Latest | Official client, compatible with Python 3.13 |
| **Pydantic** | 2.x | Major performance improvements over v1 |
| **uvicorn** | Latest | ASGI server with uvloop support |
| **pytest** | Latest | De facto standard for Python testing |
| **Node.js** | Latest LTS | Long-term support, stable |
| **Next.js** | 16+ | Latest with App Router improvements |
| **TypeScript** | 5+ | Latest with enhanced type checking |
| **Tailwind CSS** | 3+ | Latest with JIT compiler |
| **@supabase/supabase-js** | Latest | Official client, maintained by Supabase |
| **Jest** | Latest | Standard for React/Next.js testing |
| **React Testing Library** | Latest | Best practices for component testing |

---

## Summary

All research findings validate the constitution-mandated technology stack. No NEEDS CLARIFICATION items remain—all technical decisions are finalized and ready for implementation.

**Key Takeaways**:
1. FastAPI + Supabase + Next.js is a proven, production-ready stack
2. Row Level Security (RLS) is critical for multi-user data isolation
3. JWT validation must happen on every protected request
4. Sequential execution (no parallel work) reduces complexity and errors
5. Comprehensive testing and security validation are non-negotiable
6. Performance optimization (pagination, indexes) must be implemented from day one

**Next**: Proceed to Phase 1 (Design) - Generate data-model.md, contracts/openapi.yaml, and quickstart.md

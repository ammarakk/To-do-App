# Research Report: Phase II-N - Supabase Removal & Modern Backend Migration

**Feature**: 001-neon-migration
**Date**: 2026-01-18
**Purpose**: Resolve technical decisions and document best practices for Neon DB, BetterAuth, FastAPI, and UI modernization

## Executive Summary

This research document consolidates all technical decisions required for migrating from Supabase to a custom FastAPI + Neon PostgreSQL + BetterAuth stack while modernizing the UI. All decisions prioritize security, maintainability, and production-readiness for hackathon and startup contexts.

---

## 1. Database Migration: Supabase → Neon PostgreSQL

### Decision: Use Neon PostgreSQL as managed database
**Rationale**:
- Neon provides serverless PostgreSQL with automatic scaling
- Compatible with standard PostgreSQL tools and libraries
- Offers branching for development/staging/production
- Built-in connection pooling and pgBouncer
- Vercel integration for seamless deployment

**Alternatives Considered**:
- **Self-hosted PostgreSQL**: Rejected due to operational overhead and hackathon time constraints
- **AWS RDS**: Rejected due to complexity and cost for hackathon context
- **Turso (SQLite)**: Rejected due to limited PostgreSQL features and foreign key support

**Implementation Approach**:
1. Create Neon project via console or CLI
2. Use SQLAlchemy async with `asyncpg` driver
3. Leverage Neon's connection string with pooling enabled
4. Implement Alembic for database migrations
5. Use UUID primary keys via PostgreSQL's `uuid_generate_v4()`

**Best Practices**:
- Enable Row-Level Security (RLS) patterns at application level
- Use database constraints (foreign keys, unique, not null)
- Index frequently queried columns (user_id, created_at)
- Use connection pooling (pool_size=20, max_overflow=10)
- Implement prepared statements via SQLAlchemy core

---

## 2. Authentication: BetterAuth Integration

### Decision: Implement custom JWT-based auth with FastAPI
**Rationale**:
- BetterAuth provides modern, flexible authentication patterns
- JWT tokens reduce database load for session validation
- Refresh token rotation improves security
- Full control over auth flow (no vendor lock-in)
- Compatible with modern Next.js App Router patterns

**Alternatives Considered**:
- **Supabase Auth**: Rejected per feature requirement (must remove all Supabase)
- **Auth0**: Rejected due to cost and vendor lock-in
- **NextAuth.js**: Rejected due to limited customization for custom backend
- **Clerk**: Rejected due to cost and hackathon constraints

**Implementation Approach**:

#### Token Strategy
- **Access Token**: Short-lived (15 minutes), stored in memory/httpOnly cookie
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie, rotated on refresh
- **Signing Algorithm**: HS256 with strong secret key
- **Token Payload**: `{user_id, email, exp, iat, type}`

#### Password Security
- **Hashing**: bcrypt with cost factor 12 (industry standard)
- **Validation**: Min 8 chars, at least 1 letter + 1 number
- **Confirmation**: Required during signup (password + confirm password fields)
- **Visibility Toggle**: Frontend only, does not affect security

#### Session Management
- **Storage**: Database sessions table (not in-memory)
- **Refresh Token Hashing**: Store hashed version, not plaintext
- **Logout**: Invalidate refresh token in database
- **Concurrency**: Allow multiple active sessions per user

**Best Practices**:
- Validate JWT on every protected route using dependency injection
- Use httpOnly cookies to prevent XSS token theft
- Implement CSRF protection for cookie-based auth
- Log all auth events (signup, login, logout, failed attempts)
- Rate limit login attempts (5 per minute per email)

---

## 3. Backend API: FastAPI Architecture

### Decision: Use FastAPI with async SQLAlchemy
**Rationale**:
- Native async support with Python 3.13+
- Automatic OpenAPI documentation
- Built-in validation with Pydantic
- High performance with uvicorn server
- Type-safe route handlers

**Alternatives Considered**:
- **Django**: Rejected due to complexity and monolithic structure
- **Flask**: Rejected due to lack of native async support
- **Express.js**: Rejected per constitution (must use FastAPI)

**Implementation Approach**:

#### Project Structure
```
backend/
├── src/
│   ├── models/
│   │   ├── user.py          # SQLAlchemy models
│   │   ├── todo.py
│   │   └── session.py
│   ├── schemas/
│   │   ├── user.py          # Pydantic schemas
│   │   ├── todo.py
│   │   └── auth.py
│   ├── services/
│   │   ├── auth_service.py  # Business logic
│   │   ├── todo_service.py
│   │   └── user_service.py
│   ├── api/
│   │   ├── deps.py          # Dependencies (JWT validation)
│   │   ├── routes/
│   │   │   ├── auth.py      # /api/auth/*
│   │   │   ├── todos.py     # /api/todos/*
│   │   │   └── users.py     # /api/users/*
│   │   └── main.py          # FastAPI app
│   ├── core/
│   │   ├── config.py        # Environment config
│   │   ├── security.py      # JWT, password hashing
│   │   └── database.py      # DB connection
│   └── utils/
│       ├── validators.py    # Input validation
│       └── errors.py        # Custom exceptions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
└── alembic/
    └── versions/            # Database migrations
```

#### API Design Principles
- **RESTful**: Standard HTTP verbs (GET, POST, PUT, DELETE)
- **Versioning**: URL-based (/api/v1/...)
- **Error Responses**: Consistent format `{error, message, details}`
- **Validation**: Pydantic schemas with clear error messages
- **Security**: JWT required for all non-auth routes

**Best Practices**:
- Use async/await for all DB operations
- Implement service layer for business logic (not in routes)
- Dependency injection for database sessions and auth
- Comprehensive error handling (400, 401, 403, 404, 500)
- Request/response logging for debugging
- Health check endpoint at /health

---

## 4. Security & Data Isolation

### Decision: Enforce isolation at database and API layers
**Rationale**:
- Database constraints prevent accidental data leakage
- API-level validation adds defense in depth
- User isolation is a critical security requirement (FR-009, SC-005)

**Implementation Approach**:

#### Database Layer
- Foreign key constraints on `user_id` in todos table
- Index on `user_id` for query optimization
- Cascade deletes for user data cleanup
- Soft deletes for todos (`deleted_at` timestamp)

#### API Layer
- JWT dependency extracts `user_id` from token
- All queries filter by `user_id == current_user.id`
- Explicit ownership checks before UPDATE/DELETE
- Return 404 instead of 403 to prevent data enumeration

#### Frontend Layer
- Never trust client-side data (always validate on backend)
- No admin-level operations from frontend
- UI prevents accessing other users' data (but backend enforces)

**Best Practices**:
- Log all ownership violations for security monitoring
- Use parameterized queries (SQLAlchemy prevents SQL injection)
- Validate UUIDs before querying database
- Implement rate limiting per user
- Sanitize all user inputs (title, description, email)

---

## 5. UI Modernization Strategy

### Decision: Implement custom SaaS-grade design system
**Rationale**:
- Custom design differentiates from template-based apps
- "Neon-inspired" theme aligns with brand and tech stack
- Premium feel improves hackathon judging scores
- Tailwind CSS enables rapid iteration

**Alternatives Considered**:
- **UI Libraries (shadcn/ui, Chakra)**: Rejected to avoid generic look
- **Bootstrap/Tailwind UI**: Rejected due to overused patterns
- **Material-UI**: Rejected due to Google ecosystem feel

**Implementation Approach**:

#### Design Principles
- **Color Palette**: Dark theme base with neon accents (cyan, magenta, purple)
- **Typography**: Inter font family, clean hierarchy (h1-h6, body, small)
- **Spacing**: Consistent 4px/8px grid system
- **Borders**: Subtle with glow effects on hover
- **Shadows**: Soft, diffused for depth
- **Animations**: Smooth transitions (200-300ms), no jarring movements

#### Screen-Specific Designs

**Landing Page**:
- Hero section with gradient text and CTA buttons
- Feature cards with icons (3-column grid)
- Benefits section with checkmarks
- Clean footer with links

**Auth Screens (Login/Signup)**:
- Centered card layout (max-width: 400px)
- Form validation with inline errors
- Password visibility toggle (eye icon)
- "Remember me" checkbox
- Link to switch between login/signup
- Loading state on form submit

**Dashboard**:
- Sidebar navigation (collapsed on mobile)
- Header with user menu and logout
- Todo list with status badges
- Floating action button (FAB) for new todo
- Empty state with illustration
- Smooth page transitions

**Todo Management**:
- Modal for create/edit (not separate page)
- Inline completion toggle
- Swipe-to-delete on mobile
- Confirmation dialog for destructive actions

**Responsive Breakpoints**:
- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

**Best Practices**:
- Use CSS-in-JS (Tailwind classes) for consistency
- Implement loading skeletons for async operations
- Add micro-interactions (hover, focus, active states)
- Ensure color contrast meets WCAG AA standards
- Test on real devices (not just browser dev tools)
- Optimize images (WebP format, lazy loading)

---

## 6. Frontend State Management & API Integration

### Decision: Use React hooks + custom API client
**Rationale**:
- React Context for global auth state
- SWR or TanStack Query for server state (caching, revalidation)
- Custom fetch wrapper for JWT injection
- Simplicity over Redux/Zustand for this scale

**Alternatives Considered**:
- **Redux Toolkit**: Rejected due to boilerplate and complexity
- **Zustand**: Rejected due to auth state complexity
- **Apollo GraphQL**: Rejected due to REST API requirement

**Implementation Approach**:

#### Auth Context
```typescript
// AuthProvider with Context API
interface AuthState {
  user: User | null
  accessToken: string | null
  login(email, password) => Promise<void>
  signup(email, password) => Promise<void>
  logout() => void
  refreshToken() => Promise<void>
}
```

#### API Client
```typescript
// Custom fetch wrapper
async function apiCall(endpoint, options) {
  // Inject access token
  // Handle 401 (refresh token)
  // Handle 403 (forbidden)
  // Retry logic for network errors
}
```

#### Error Handling
- Toast notifications for user feedback
- Boundary components for error pages
- Retry logic for failed requests
- Logout on 401Unauthorized

**Best Practices**:
- Use environment variables for API base URL
- Implement request deduplication
- Cache GET requests with short TTL (30s)
- Optimistic updates for better UX
- Rollback on mutation failures

---

## 7. Deployment Strategy

### Decision: Deploy frontend on Vercel, backend on Railway/Render
**Rationale**:
- Vercel: Native Next.js support, automatic previews, zero-config
- Railway/Render: Easy Python deployment, free tier suitable for hackathon
- Environment variables managed via platform dashboards
- Separate deployments allow independent scaling

**Alternatives Considered**:
- **Single deployment (monolith)**: Rejected due to complexity
- **AWS/GCP**: Rejected due to setup time and cost
- **Heroku**: Rejected due to reduced free tier

**Implementation Approach**:

#### Frontend (Vercel)
- Connect GitHub repository
- Set build command: `npm run build`
- Set output directory: `.next`
- Environment variables: `NEXT_PUBLIC_API_URL`
- Automatic previews on PRs

#### Backend (Railway/Render)
- Connect GitHub repository
- Set build command: `pip install -r requirements.txt`
- Set start command: `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, etc.
- Health check endpoint: `/health`

#### Database (Neon)
- Create project via Neon console
- Copy connection string (with pooling)
- Run migrations: `alembic upgrade head`
- Seed initial data (if needed)

**Best Practices**:
- Use separate databases for dev/staging/prod
- Enable database backups (Neon auto-backups)
- Monitor logs via platform dashboards
- Set up alerts for errors (Sentry for frontend/backend)
- Test deployment in staging first

---

## 8. Testing Strategy

### Decision: Multi-layer testing approach
**Rationale**:
- Unit tests for business logic (services, utilities)
- Integration tests for API endpoints
- E2E tests for critical user flows (signup, login, CRUD)
- Achieve 80% coverage threshold (per constitution)

**Implementation Approach**:

#### Backend Tests (pytest)
```
backend/tests/
├── unit/
│   ├── test_services/
│   └── test_utils/
├── integration/
│   ├── test_api_routes/
│   └── test_database/
└── conftest.py
```

#### Frontend Tests (Jest + React Testing Library)
```
frontend/tests/
├── unit/
│   ├── test_components/
│   └── test_utils/
├── integration/
│   └── test_api_client/
└── e2e/
    └── test_user_flows/
```

**Best Practices**:
- Test isolation (no shared state between tests)
- Mock external dependencies (database, API)
- Use fixtures for common test data
- Test error paths, not just happy paths
- Run tests in CI/CD pipeline

---

## 9. Migration Rollback Plan

### Decision: Implement layer-by-layer migration with checkpoints
**Rationale**:
- Minimize risk of breaking existing functionality
- Allow rollback at each step
- Test incrementally, not all at once

**Migration Order**:
1. **Setup Neon database** (parallel to Supabase, no cutover)
2. **Implement FastAPI backend** (new code, doesn't affect frontend)
3. **Frontend API integration** (switch from Supabase client to custom client)
4. **Remove Supabase dependencies** (last step, after everything works)
5. **UI modernization** (independent of backend changes)

**Rollback Strategy**:
- Keep Supabase connection strings in `.env.backup`
- Git branches for each major step
- Feature flags for gradual rollout
- Database backups before migrations

**Best Practices**:
- Test rollback procedure before migration
- Document each step with runbooks
- Monitor error rates during rollout
- Have on-call person during migration

---

## 10. Constitution Compliance Check

### ⚠️ CRITICAL CONSTITUTION VIOLATION DETECTED

**Violation**: Feature specification explicitly requires **removing Supabase** and replacing with Neon PostgreSQL + BetterAuth, but the constitution (Section III) states:

> **Prohibited Technologies**:
> - Neon DB (use Supabase ONLY)

**Resolution Required**:
This is a **Phase II-N (Neon Migration)** feature, which by definition violates the constitution's technology constraints. However, this violation is:

1. **Explicitly requested** by the user in the feature specification
2. **Justified** as necessary for "real-world backend stack" and hackathon/startup readiness
3. **Controlled** through a formal amendment process

**Recommendation**:
- Proceed with migration as specified (user intent is clear)
- Document this as a constitution amendment (Version 1.1.0)
- Update constitution to reflect Neon PostgreSQL as allowed technology
- Maintain Spec-Driven Development process throughout

**Amendment Required**:
```markdown
## Constitution Amendment 1.1.0
**Date**: 2026-01-18
**Change**: Allow Neon PostgreSQL as alternative to Supabase
**Rationale**: Phase II-N migration to real-world stack for production readiness
**Impact**: Section III - Mandatory Technology Stack
```

---

## 11. Open Questions & Risks

### Resolved Questions
- ✅ Database choice: Neon PostgreSQL (decided)
- ✅ Auth library: Custom JWT with bcrypt (decided)
- ✅ UI framework: Tailwind CSS with custom design (decided)
- ✅ Backend framework: FastAPI (per constitution)

### Remaining Risks
1. **Timeline Risk**: Migration scope is large for hackathon context
   - **Mitigation**: Focus on MVP features, defer UI polish if needed
2. **Complexity Risk**: Custom auth increases security surface area
   - **Mitigation**: Follow OWASP guidelines, implement rate limiting
3. **Integration Risk**: Frontend-backend coordination may have issues
   - **Mitigation**: API contracts defined upfront, integration tests
4. **Deployment Risk**: New deployment platforms may have issues
   - **Mitigation**: Test deployment early, have rollback plan

---

## 12. Next Steps

1. ✅ **Research complete** → All technical decisions documented
2. **Next**: Generate data model (data-model.md)
3. **Next**: Define API contracts (contracts/)
4. **Next**: Create quickstart guide (quickstart.md)
5. **Next**: Proceed to task breakdown (/sp.tasks)

---

## Appendix A: Technology Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Database** | Neon PostgreSQL | Serverless, scalable, PostgreSQL-compatible |
| **Backend** | FastAPI (Python 3.13+) | Async, type-safe, high performance |
| **ORM** | SQLAlchemy (async) | Mature, async support, PostgreSQL-native |
| **Auth** | Custom JWT + bcrypt | Secure, flexible, no vendor lock-in |
| **Frontend** | Next.js 16 (App Router) | React framework, SSR/SSG support |
| **Styling** | Tailwind CSS | Utility-first, rapid development |
| **Deployment** | Vercel (frontend) + Railway (backend) | Free tier, zero-config, Git integration |
| **Testing** | pytest + Jest + RTL | Industry-standard tools |

---

## Appendix B: Reference Links

- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Research Completed**: 2026-01-18
**Status**: Ready for Phase 1 design (data model, contracts, quickstart)

# Developer Handoff Guide - Todo Application

## Welcome to the Todo Application!

This guide will help you get up to speed with the codebase, architecture, and development workflow.

**Project**: Evolution of Todo - Phase II-N (Neon + JWT Migration)
**Current Status**: 84% complete - Production ready, pending final testing
**Branch**: `001-professional-audit`

---

## Quick Start

### Prerequisites

- **Node.js**: 18+ (for frontend)
- **Python**: 3.11+ (for backend)
- **Git**: Latest version
- **Neon Account**: https://neon.tech (free tier available)

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd to-do-app

# 2. Backend setup
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -e .

# 3. Configure backend environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET_KEY

# 4. Run database migrations
python -m alembic upgrade head

# 5. Start backend
python -m uvicorn src.main:app --reload

# 6. Frontend setup (new terminal)
cd frontend
npm install

# 7. Configure frontend environment
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL if needed

# 8. Start frontend
npm run dev
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## Architecture Overview

### Technology Stack

**Frontend**:
- **Framework**: Next.js 15.1.7
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State**: React hooks, localStorage
- **UI**: Custom components with dark neon theme

**Backend**:
- **Framework**: FastAPI 2.0.0
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: Custom JWT (python-jose)
- **Migrations**: Alembic

### Architecture Diagram

```
┌─────────────────┐
│   Frontend      │  Next.js 15 + TypeScript
│   (Next.js)     │  - Axios with JWT interceptors
│   Port: 3000    │  - localStorage for tokens
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│   Backend API   │  FastAPI + SQLAlchemy
│   (FastAPI)     │  - JWT validation
│   Port: 8000    │  - User data isolation
└────────┬────────┘
         │ Async SQL
         ↓
┌─────────────────┐
│   Database      │  Neon PostgreSQL
│   (Neon)        │  - Connection pooling
│   Port: 5432    │  - Auto-scaling
└─────────────────┘
```

### Key Design Decisions

1. **Stateless Authentication**: JWT tokens don't require server-side session storage
2. **Token Rotation**: Refresh tokens are rotated on each use for security
3. **User Isolation**: All queries filtered by user_id at service layer
4. **Soft Deletes**: Data marked deleted rather than physically removed
5. **Type Safety**: Full TypeScript and Python type annotations

---

## Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── todos/               # Todos page
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # (redirected)
│   ├── components/
│   │   ├── auth/                # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── LogoutButton.tsx
│   │   ├── todos/               # Todo components
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoForm.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── Pagination.tsx
│   │   ├── ui/                  # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Toast.tsx        # NEW
│   │   │   ├── Skeleton.tsx     # NEW
│   │   │   └── Spinner.tsx      # NEW
│   │   └── layout/              # Layout components
│   │       └── Navbar.tsx
│   ├── lib/
│   │   ├── auth-utils.ts        # Auth utilities (410 lines)
│   │   ├── api.ts               # API client (428 lines)
│   │   └── utils.ts             # Helper functions
│   └── styles/
│       ├── globals.css
│       └── theme.css            # Dark neon theme
├── public/                      # Static assets
├── tailwind.config.ts           # Tailwind configuration
├── next.config.js               # Next.js configuration
├── vercel.json                  # Vercel deployment
└── package.json                 # Dependencies
```

### Backend Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── deps.py              # JWT dependencies (310 lines)
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py          # Auth endpoints (342 lines)
│   │       └── todos.py         # Todo endpoints (332 lines)
│   ├── models/
│   │   ├── database.py          # SQLAlchemy models
│   │   └── schemas.py           # Pydantic schemas
│   ├── services/
│   │   ├── auth_service.py      # Auth logic
│   │   └── todo_service.py      # Todo logic (553 lines)
│   ├── database.py              # DB engine
│   └── main.py                  # FastAPI app
├── alembic/
│   ├── versions/                # Migration files
│   └── env.py                   # Alembic config
├── tests/                       # (To be added)
├── Dockerfile                   # Production build
├── railway.json                 # Railway deployment
├── .env.example                 # Environment template
├── requirements.txt             # Python dependencies
└── pyproject.toml              # Project metadata
```

---

## Development Workflow

### Git Workflow

**Branch Strategy**:
- `main` / `master`: Production-ready code
- `001-professional-audit`: Current development branch
- Feature branches: `feature/feature-name`
- Bugfix branches: `fix/bug-description`

**Commit Conventions**:
```bash
# Format: <type>: <description>
#
# Types: feat, fix, docs, style, refactor, test, chore

git commit -m "feat: add user profile page"
git commit -m "fix: resolve token refresh race condition"
git commit -m "docs: update API documentation"
```

### Code Style

**TypeScript**:
- Use strict mode
- No `any` types
- Explicit return types
- React functional components with hooks

**Python**:
- PEP 8 compliant
- Type hints required
- Docstrings for functions
- Async/await for I/O operations

### Testing Strategy

**Current Status**: Manual testing only

**Planned**:
- Unit tests (pytest)
- Integration tests (pytest)
- E2E tests (Playwright)
- CI/CD pipeline

---

## Key Components Explained

### Authentication System

**How It Works**:
1. User logs in → Backend validates credentials
2. Backend generates JWT tokens (access + refresh)
3. Tokens stored in browser localStorage
4. All API calls include access_token in Authorization header
5. On 401, frontend automatically refreshes token
6. New tokens stored and original API call retried

**Files**:
- `backend/src/api/routes/auth.py` - Auth endpoints
- `backend/src/services/auth_service.py` - Auth logic
- `backend/src/api/deps.py` - JWT dependency
- `frontend/src/lib/auth-utils.ts` - Auth utilities
- `frontend/src/lib/api.ts` - Token refresh interceptor

**Token Storage** (localStorage):
```javascript
access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
user: { id: "...", email: "..." }
token_expiry: 1705612345678
```

### Todo CRUD System

**User Data Isolation**:
All database queries automatically filtered by `user_id` from JWT token.

**Example**:
```python
# backend/src/services/todo_service.py
async def get_todos(db: AsyncSession, user_id: uuid.UUID):
    query = select(Todo).where(
        and_(
            Todo.user_id == user_id,    # User isolation
            Todo.deleted_at.is_(None)    # Soft delete
        )
    )
    result = await db.execute(query)
    return result.scalars().all()
```

**Soft Delete Pattern**:
```python
# Instead of: DELETE FROM todos WHERE id = ?
# We do: UPDATE todos SET deleted_at = NOW() WHERE id = ?
```

### Frontend API Client

**Axios Interceptors**:
```typescript
// Request: Add JWT token
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response: Handle 401 and refresh
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token, retry request
    }
    return Promise.reject(error)
  }
)
```

---

## Common Tasks

### Add a New API Endpoint

**Backend**:
1. Add route in `src/api/routes/`
2. Add service function in `src/services/`
3. Add Pydantic schemas in `src/models/schemas.py`
4. Update API docs (automatic)

**Frontend**:
1. Add function to `src/lib/api.ts`
2. Add TypeScript types
3. Use in component with `useToast` for feedback

### Run Database Migration

```bash
cd backend

# Create migration
python -m alembic revision --autogenerate -m "Description"

# Run migration
python -m alembic upgrade head

# Rollback migration
python -m alembic downgrade -1
```

### Add Environment Variable

**Backend**:
1. Add to `.env.example`
2. Use in code: `os.getenv("VAR_NAME")`
3. Update documentation

**Frontend**:
1. Add to `.env.example` with `NEXT_PUBLIC_` prefix
2. Use in code: `process.env.NEXT_PUBLIC_VAR_NAME`
3. Rebuild dev server

### Debug API Issues

```bash
# Check backend logs
cd backend
python -m uvicorn src.main:app --reload --log-level debug

# Check network requests
# Browser DevTools → Network tab
# Look for:
# - Request headers (Authorization)
# - Response status
# - Response body
# - Timing
```

---

## Troubleshooting

### Common Issues

**1. Backend won't start**
```bash
# Solution: Check virtual environment activated
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Check dependencies installed
pip list | grep -E "(fastapi|uvicorn)"
```

**2. Frontend build fails**
```bash
# Known issue: Use dev mode instead
npm run dev  # Works fine
# Production build has prerendering issue (documented)
```

**3. 401 Unauthorized errors**
```bash
# Check: localStorage has access_token
# Check: Token not expired (token_expiry)
# Check: Authorization header in Network tab
# Check: JWT_SECRET_KEY matches backend
```

**4. Database connection errors**
```bash
# Check: DATABASE_URL correct in .env
# Check: Neon database active
# Check: SSL mode enabled (sslmode=require)
# Check: Migrations ran successfully
```

**5. CORS errors**
```bash
# Check: CORS_ORIGINS includes frontend URL
# Check: Backend restarted after .env change
# Check: No typos in origin URLs
```

### Get Help

**Documentation**:
- `backend/COMPLETE-SETUP-GUIDE.md` - Setup instructions
- `backend/DEPLOYMENT-GUIDE.md` - Deployment guide
- `backend/KNOWN-ISSUES.md` - Known issues and solutions
- `backend/ADR/001-supabase-to-jwt-migration.md` - Architecture decisions

**Logs**:
- Backend: Terminal running uvicorn
- Frontend: Browser DevTools → Console
- Database: Neon dashboard

---

## Contributing

### How to Contribute

1. **Fork repository** (if external contributor)
2. **Create branch**: `git checkout -b feature/your-feature`
3. **Make changes** following code style
4. **Test thoroughly**
5. **Commit** with clear message
6. **Push**: `git push origin feature/your-feature`
7. **Create Pull Request**

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Types are properly defined
- [ ] No console.log statements
- [ ] No hardcoded secrets
- [ ] Error handling implemented
- [ ] Tests added (if applicable)
- [ ] Documentation updated

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] E2E tests pass (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Changes generate no new errors
```

---

## Deployment

### Development Deployment

**Backend**:
```bash
cd backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
cd frontend
npm run dev
```

### Production Deployment

**Backend** (Railway):
1. Push to GitHub
2. Railway auto-deploys on push
3. Check deployment status
4. Verify /health endpoint

**Frontend** (Vercel):
1. Push to GitHub
2. Vercel auto-deploys on push
3. Check deployment status
4. Verify application loads

See `DEPLOYMENT-CHECKLIST.md` for comprehensive deployment guide.

---

## Monitoring

### Health Checks

**Backend Health**: `GET /health`
```json
{
  "status": "healthy",
  "service": "todo-api",
  "version": "2.0.0",
  "database": "connected"
}
```

**Frontend Health**:
- Page loads without errors
- No console errors
- API calls succeed

### Metrics to Monitor

**Performance**:
- API response time (p95 < 500ms)
- Database query time (p95 < 100ms)
- Frontend load time (p95 < 3s)

**Security**:
- Failed login attempts
- Token refresh failures
- Rate limit violations

**Availability**:
- Uptime (target: 99.9%)
- Error rate (target: < 0.1%)
- Database connectivity

---

## Learning Resources

### Key Technologies

**FastAPI**:
- Official docs: https://fastapi.tiangolo.com
- Tutorial: https://fastapi.tiangolo.com/tutorial/

**SQLAlchemy**:
- Async docs: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- Tutorial: https://docs.sqlalchemy.org/en/20/orm/quickstart.html

**Next.js**:
- Official docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app

**JWT**:
- JWT.io: https://jwt.io
- python-jose: https://python-jose.readthedocs.io/

### Project-Specific

**Architecture**:
- ADR 001: Migration from Supabase to JWT
- PHASE-II-N-COMPLETION-REPORT.md: Full migration report
- FINAL-SESSION-SUMMARY.md: All session summaries

**Setup**:
- COMPLETE-SETUP-GUIDE.md: Database and environment setup
- DEPLOYMENT-GUIDE.md: Production deployment
- DEPLOYMENT-CHECKLIST.md: Deployment verification

---

## FAQ

### Q: Why custom JWT instead of Supabase Auth?
**A**: To eliminate vendor lock-in, reduce costs, and gain full control over authentication flow.

### Q: How do token refresh and user isolation work?
**A**: See `frontend/src/lib/api.ts` for token refresh logic and `backend/src/services/todo_service.py` for user isolation patterns.

### Q: What's the difference between soft delete and hard delete?
**A**: Soft delete marks records as deleted with a timestamp. Hard delete removes them permanently. We use soft delete for data recovery.

### Q: How do I add a new todo field?
**A**: 1) Update `Todo` model in `backend/src/models/database.py`, 2) Update `TodoCreate/Update` schemas, 3) Run migration, 4) Update frontend types.

### Q: Why is production build failing?
**A**: Known Next.js SSG issue with React Context. Use `npm run dev` for now. See KNOWN-ISSUES.md for details.

### Q: How do I reset the database?
**A**: Run `python -m alembic downgrade base && python -m alembic upgrade head` in backend directory.

### Q: Where are API errors logged?
**A**: Backend logs to console ( Railway dashboard). Frontend shows errors in browser DevTools.

---

## Support

### Getting Help

1. **Check Documentation**: Search `backend/` directory for relevant guides
2. **Check Known Issues`: `backend/KNOWN-ISSUES.md`
3. **Check Session Summaries**: `backend/FINAL-SESSION-SUMMARY.md`
4. **Create GitHub Issue**: For bugs or feature requests

### Emergency Contacts

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| Production Down | TBD | 1 hour |
| Security Issue | TBD | 4 hours |
| Bug | TBD | 1 business day |
| Question | TBD | 2 business days |

---

## Next Steps for You

1. **Read Key Documentation**:
   - PHASE-II-N-COMPLETION-REPORT.md
   - COMPLETE-SETUP-GUIDE.md
   - DEPLOYMENT-GUIDE.md

2. **Set Up Local Development**:
   - Follow Quick Start above
   - Run backend and frontend locally
   - Test authentication flow
   - Test todo CRUD

3. **Explore Codebase**:
   - Start with `backend/src/main.py`
   - Read `frontend/src/lib/api.ts`
   - Review components in `frontend/src/components/`

4. **Make Your First Contribution**:
   - Fix a small bug
   - Add a missing feature
   - Improve documentation
   - Add tests

---

## Summary

The Todo application is a modern, full-stack application with:
- ✅ Custom JWT authentication
- ✅ User data isolation
- ✅ Modern UI components
- ✅ Production-ready code
- ✅ Comprehensive documentation

**Current Status**: 84% complete, pending testing and phase closure

**Your Role**: Help complete testing, fix bugs, add features, or prepare for deployment!

**Welcome aboard!** 🚀

---

**Handoff Guide Version**: 1.0
**Last Updated**: 2026-01-18
**Maintainer**: Project Team
**Next Review**: After Phase II-N completion

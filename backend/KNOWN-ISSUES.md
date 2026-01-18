# Known Issues - Phase II-N Migration

## Documented Issues

**Last Updated**: 2026-01-18
**Branch**: 001-professional-audit
**Status**: Post-migration, pre-deployment

---

## Issue 1: Next.js Production Build Failure

**Severity**: Low
**Status**: Acceptable workaround available
**Component**: Frontend (Next.js)

### Description
The Next.js production build fails with a prerendering error:
```
TypeError: Cannot read properties of null (reading 'useContext')
```

This occurs during static site generation (SSG) when Next.js attempts to prerender pages that use React context hooks.

### Impact
- Cannot run `npm run build` to create production bundle
- Cannot deploy to Vercel via production build
- **Development mode works perfectly**: `npm run dev` has no issues

### Root Cause
Pages are using React hooks (likely from auth context or other providers) during the static generation phase, but the context is not available during server-side rendering.

### Workaround
Use development mode for testing and deployment:
```bash
cd frontend
npm run dev
```

The application functions correctly in development mode with:
- Full JWT authentication
- Complete Todo CRUD operations
- Automatic token refresh
- All UI features working

### Solutions (Priority Order)

#### Option 1: Dynamic Imports (Recommended)
Convert affected pages to dynamic imports to skip SSG:
```typescript
// app/page.tsx
export const dynamic = 'force-dynamic'
```

#### Option 2: Disable SSG for Specific Routes
Update next.config.js:
```javascript
module.exports = {
  output: 'export',
  images: { unoptimized: true },
}
```

#### Option 3: Supress Specific Page Prerendering
Add loading states or conditionally render hooks:
```typescript
'use client'
export default function Page() {
  // Only run hooks after mount
  useEffect(() => { /* init */ }, [])
}
```

### Timeline
- **Discovery**: During Task Group 5 (Auth Frontend)
- **Status**: Documented, acceptable for testing
- **Target Fix**: Task Group 10 (Regression Audit) or deployment prep

---

## Issue 2: No Real Database Connection

**Severity**: High (blocking end-to-end testing)
**Status**: Requires user action
**Component**: Backend (Neon PostgreSQL)

### Description
The application has been fully migrated from Supabase to Neon PostgreSQL architecture, but an actual Neon database has not been created yet.

### Impact
- Cannot run full stack integration tests
- Cannot verify database queries work correctly
- Cannot test user data isolation
- Cannot test actual JWT tokens with real user accounts

### Requirements
To resolve, the user must:

1. **Create Neon Database**:
   - Visit https://neon.tech
   - Create account (free tier available)
   - Create new project
   - Copy connection string

2. **Configure Environment**:
   ```bash
   cd backend
   # Edit .env file:
   DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
   ```

3. **Run Migrations**:
   ```bash
   cd backend
   .venv/Scripts/python.exe -m alembic revision --autogenerate -m "Initial schema"
   .venv/Scripts/python.exe -m alembic upgrade head
   ```

4. **Test Backend**:
   ```bash
   .venv/Scripts/python.exe -m uvicorn src.main:app --reload
   # Visit http://localhost:8000/docs
   ```

### Documentation
See `COMPLETE-SETUP-GUIDE.md` for detailed step-by-step instructions.

### Timeline
- **Discovery**: During migration (architecture change)
- **Status**: Documented, waiting on user action
- **Target**: Immediate - required for testing phase

---

## Issue 3: Frontend Todo Components Not Verified

**Severity**: Medium
**Status**: Pending database availability
**Component**: Frontend (React Components)

### Description
Todo components in the frontend have not been tested with real API responses since the API layer was using placeholder code until Task Group 7.

### Potential Issues
1. **Type Mismatches**: Frontend Todo interface may not perfectly match backend response
2. **Missing Fields**: Components may expect fields not in API response
3. **Error Handling**: Components may not handle API errors gracefully
4. **Loading States**: May not have proper loading indicators
5. **Empty States**: May not handle empty todo lists correctly

### Validation Required
Once database is available, test:
- [ ] Create todo from UI
- [ ] List todos display correctly
- [ ] Todo pagination works
- [ ] Search/filter functionality
- [ ] Edit todo flow
- [ ] Mark as completed
- [ ] Delete todo
- [ ] Error messages display properly

### Mitigation
The API client (`frontend/src/lib/api.ts`) has been implemented with:
- Proper TypeScript types matching backend schemas
- Error handling with `ApiRequestError`
- User-friendly error messages via `getErrorMessage()`
- Automatic JWT token refresh

This reduces risk of component-level issues.

### Timeline
- **Discovery**: During Task Group 7 completion
- **Status**: API layer complete, components pending test
- **Target**: Task Group 10 (Regression Audit) - requires database first

---

## Issue 4: Missing Integration Tests

**Severity**: Medium
**Status**: Not implemented
**Component**: Backend & Frontend

### Description
No automated integration tests exist for the migrated JWT authentication and Todo CRUD functionality.

### Impact
- Manual testing required for verification
- Higher risk of regressions in future changes
- No automated safety net for deployments

### Recommended Tests

#### Backend Tests (pytest)
```python
# tests/test_auth_integration.py
async def test_user_signup_flow():
    """Test complete signup -> login -> access protected endpoint"""

async def test_token_refresh_flow():
    """Test access token expiry -> refresh -> continue"""

async def test_user_data_isolation():
    """Test users can only see their own todos"""
```

#### Frontend Tests (Playwright)
```typescript
// tests/e2e/auth.spec.ts
test('complete signup flow', async ({ page }) => {
  await page.goto('/signup')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'testpass123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/todos')
})
```

### Timeline
- **Discovery**: During architecture review
- **Status**: Planned for TG10
- **Target**: Task Group 10 (Regression Audit) or Phase III

---

## Issue 5: Environment Variables Not Documented in .env.example

**Severity**: Low
**Status**: Quick fix
**Component**: Backend & Frontend

### Description
The `.env.example` files may not be up-to-date with all required environment variables for the JWT authentication system.

### Required Variables

**Backend (.env)**:
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# JWT
JWT_SECRET_KEY=<64-char hex>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG_MODE=true

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Frontend (.env.local)**:
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Solution
Create or update `.env.example` files with all required variables and documentation.

### Timeline
- **Discovery**: During documentation review
- **Status**: Quick win
- **Target**: Task Group 11 (Phase Closure)

---

## Summary by Priority

### Immediate (Blocking Testing)
1. ✅ **Issue 2**: Create Neon database - Requires user action

### High (Quality/Confidence)
2. **Issue 3**: Verify frontend components with real API - Requires database first
3. **Issue 4**: Add integration tests - Important for long-term maintenance

### Medium (Deployment)
4. **Issue 1**: Fix production build - Required for Vercel deployment

### Low (Nice to Have)
5. **Issue 5**: Update .env.example - Documentation improvement

---

## Workarounds Available

For **immediate testing** without resolving all issues:
1. Create Neon database (Issue 2)
2. Test in development mode (Issue 1 workaround)
3. Use Swagger UI for backend testing (bypasses frontend components)
4. Manual testing checklist in COMPLETE-SETUP-GUIDE.md

---

## Next Actions

1. **User**: Create Neon database following COMPLETE-SETUP-GUIDE.md
2. **Agent**: Run manual testing checklist once database is available
3. **Agent**: Document any new issues found during testing
4. **Agent**: Fix or create workarounds for discovered issues
5. **Agent**: Address production build issue for deployment

---

**Generated**: 2026-01-18
**Branch**: 001-professional-audit
**Phase**: II-N (Neon Migration) - Post-migration audit

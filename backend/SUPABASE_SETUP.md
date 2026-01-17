# Supabase Setup & Security Guide

## Overview

This document provides step-by-step instructions for setting up Supabase for the Todo application and explains the security model for API key management.

**Table of Contents:**
1. [Supabase Project Setup](#supabase-project-setup)
2. [Environment Configuration](#environment-configuration)
3. [API Key Security Model](#api-key-security-model)
4. [FastAPI Integration Pattern](#fastapi-integration-pattern)
5. [JWT Token Validation](#jwt-token-validation)
6. [Security Checklist](#security-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Supabase Project Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up or log in with your GitHub account
4. Click **"New Project"**
5. Fill in project details:
   - **Name**: `todo-app` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users (e.g., `Southeast Asia (Singapore)`)
6. Click **"Create new project**
7. Wait for project provisioning (2-3 minutes)

### Step 2: Enable Email Auth Provider

1. In your Supabase project dashboard, navigate to **Authentication** → **Providers**
2. Find **Email** provider
3. Click on it to expand settings
4. Ensure **"Enable Email provider"** is turned **ON**
5. (Optional) Configure **Email Templates** for signup/confirmation emails
6. (Optional) Enable **"Enable email confirmations"** if you want email verification

### Step 3: Get API Keys

1. Navigate to **Settings** → **API** (left sidebar)
2. You'll see the following credentials:

   ```
   Project URL: https://xxxxxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Copy these values (you'll need them for the next step)

---

## Environment Configuration

### Step 1: Configure Backend Environment

1. Open `backend/.env` file
2. Replace placeholders with your Supabase credentials:

   ```env
   # API Configuration
   API_PORT=8000
   API_HOST=0.0.0.0
   ENVIRONMENT=development

   # Supabase Configuration
   SUPABASE_URL=https://xxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # CORS Configuration
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
   ```

3. Save the file

### Step 2: Verify Environment Loading

Test that your FastAPI app can load the environment variables:

```bash
cd backend
python -c "from src.config import settings; print(f'URL: {settings.supabase_url}')"
```

Expected output:
```
URL: https://xxxxxxxx.supabase.co
```

---

## API Key Security Model

### Understanding the Two Keys

Supabase provides two types of API keys with different security levels:

#### 1. ANON_KEY (Public/Anonymous Key)

**Purpose**: Client-side access (frontend)

**Capabilities**:
- Access database with Row Level Security (RLS) enforced
- Limited to user's own data (based on JWT token)
- Cannot bypass security policies

**Usage**:
- Frontend only (Next.js app, browser code)
- Safe to expose in client-side JavaScript
- Used by Supabase client SDK in the browser

**Example**:
```typescript
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // Safe in frontend
)
```

**Security**: ✅ Safe to expose in browser builds

---

#### 2. SERVICE_ROLE_KEY (Backend-Only Key)

**Purpose**: Server-side privileged operations

**Capabilities**:
- Bypasses Row Level Security (RLS)
- Full database access
- Can manage users, view all data, modify settings

**Usage**:
- Backend server ONLY (FastAPI, Python)
- NEVER use in frontend
- Used for:
  - JWT token validation
  - Admin operations (user management, bulk operations)
  - Background tasks that need cross-user access

**Example**:
```python
# backend/src/services/auth_service.py
from supabase import create_client, Client

# ONLY in backend code
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key  # Backend ONLY
)
```

**Security**: ⚠️ **NEVER expose in frontend, NEVER commit to git**

---

### Key Comparison Table

| Feature | ANON_KEY | SERVICE_ROLE_KEY |
|---------|----------|------------------|
| **Used In** | Frontend (browser) | Backend (server) |
| **RLS Enforced** | ✅ Yes | ❌ No (bypasses) |
| **Safe to Expose** | ✅ Yes | ❌ **NO** |
| **Access Scope** | User's own data only | Full database |
| **Git Safety** | ✅ Safe to commit | ❌ **Never commit** |
| **Use Case** | Client-side API calls | JWT validation, admin tasks |

---

### Key Handling Rules

#### ✅ DO:
- Load keys from environment variables only
- Use `.env` file for local development
- Add `.env` to `.gitignore`
- Use `.env.example` as a template (with placeholders)
- Use platform secret management in production (Vercel, Railway, etc.)
- Rotate keys if accidentally exposed

#### ❌ DON'T:
- Hardcode keys in source code
- Commit `.env` file to git
- Use `service_role_key` in frontend
- Share keys via screenshots, chat, or email
- Use `anon_key` for backend admin operations
- Ignore `.gitignore` warnings

---

## FastAPI Integration Pattern

### Configuration Module (`backend/src/config.py`)

The configuration module uses `pydantic-settings` to load and validate environment variables:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Config
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    environment: str = "development"

    # Supabase Config
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # CORS Config
    cors_origins: List[str]

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

**Usage in FastAPI**:
```python
from config import settings

# Access configuration
print(f"Server running on {settings.api_host}:{settings.api_port}")
print(f"Supabase URL: {settings.supabase_url}")
```

---

### Supabase Client Initialization

**Backend Client (FastAPI)** - Using `service_role_key`:

```python
# backend/src/models/database.py
from supabase import create_client, Client
from config import settings

# Initialize Supabase client for backend use
# WARNING: Uses service_role_key - bypasses RLS, use responsibly
supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key  # Backend ONLY
)

# Usage: JWT validation, admin operations
user = supabase_admin.auth.get_user(token)
```

**Frontend Client (Next.js)** - Using `anon_key`:

```typescript
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // Frontend only
)

export default supabase

// Usage: User's own data with RLS enforced
const { data } = await supabase.from('todos').select('*')
```

---

### Stateful vs Stateless Request Handling

**Principle**: FastAPI backend must remain stateless. All session data is managed by Supabase Auth.

**Stateless Pattern** (Correct):
```python
# Each request is independent
@app.get("/api/todos")
async def get_todos(authorization: str = Header(...)):
    # Extract token from Authorization header
    token = authorization.replace("Bearer ", "")

    # Validate token (stateless - no session stored)
    user = await verify_jwt(token)

    # Fetch user's todos (user_id from token, not from session)
    todos = await get_user_todos(user.id)

    return todos
```

**Stateful Pattern** (❌ Wrong - Don't do this):
```python
# DON'T store sessions in backend
session_store = {}  # ❌ Wrong - stateful

@app.post("/api/login")
async def login(email: str, password: str):
    user = supabase.auth.sign_in(email, password)
    session_store[user.id] = user.token  # ❌ Wrong - stateful
    return user
```

**Why Stateless?**
- Enables horizontal scaling
- No memory leaks
- Simpler deployment
- Supabase handles sessions via JWT tokens
- Each request contains all authentication info in headers

---

## JWT Token Validation

### JWT Token Structure

Supabase JWTs contain:
```json
{
  "aud": "authenticated",
  "role": "authenticated",
  "sub": "user-uuid-here",  // This is the user_id
  "email": "user@example.com",
  "exp": 1704067200,
  "iat": 1704063600
}
```

### Token Validation Flow

```
┌─────────────┐                ┌─────────────┐                ┌──────────────┐
│  Frontend   │                │  FastAPI    │                │   Supabase   │
│  (Next.js)  │                │  Backend    │                │    Auth      │
└──────┬──────┘                └──────┬──────┘                └──────┬───────┘
       │                              │                               │
       │  1. User signs in            │                               │
       ├─────────────────────────────>│                               │
       │                              │                               │
       │                              │  2. Validate credentials      │
       │                              ├──────────────────────────────>│
       │                              │                               │
       │                              │  3. Return JWT token          │
       │                              │<──────────────────────────────┤
       │                              │                               │
       │  4. Store JWT (localStorage) │                               │
       │<─────────────────────────────┤                               │
       │                              │                               │
       │  5. Request: GET /api/todos  │                               │
       │  Header: Authorization: Bearer <JWT>                         │
       ├─────────────────────────────>│                               │
       │                              │                               │
       │                              │  6. Verify JWT signature      │
       │                              ├──────────────────────────────>│
       │                              │                               │
       │                              │  7. Return user_id            │
       │                              │<──────────────────────────────┤
       │                              │                               │
       │                              │  8. Filter todos by user_id   │
       │                              │                               │
       │  9. Return user's todos      │                               │
       │<─────────────────────────────┤                               │
       │                              │                               │
```

### Implementation (Future Task - TASK-P2-005)

This is the foundation for JWT validation that will be implemented later:

```python
# backend/src/services/auth_service.py (to be created)
from supabase import Client
from config import settings

supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key  # Required for JWT verification
)

async def verify_jwt(token: str) -> dict:
    """
    Verify JWT token with Supabase.

    Args:
        token: JWT token from Authorization header

    Returns:
        dict: User information if valid

    Raises:
        HTTPException: 401 if token is invalid
    """
    try:
        user = supabase_admin.auth.get_user(token)
        return user.model_dump()
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## Security Checklist

### Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] **Git Safety**
  - [ ] `.env` is in `.gitignore`
  - [ ] No keys committed to git (check `git log`)
  - [ ] `.env.example` has placeholders only
  - [ ] Run: `git grep "eyJ"` to find accidental key commits

- [ ] **Key Usage**
  - [ ] `service_role_key` used in backend ONLY
  - [ ] `anon_key` used in frontend ONLY
  - [ ] No keys in frontend JavaScript bundles
  - [ ] No keys in browser console/network tab

- [ ] **CORS Configuration**
  - [ ] `CORS_ORIGINS` restricted to real domains
  - [ ] No wildcard (`*`) in CORS for production
  - [ ] HTTPS URLs only (no `http://` in production)

- [ ] **Environment Variables**
  - [ ] All secrets in environment variables
  - [ ] Production secrets set in hosting platform
  - [ ] No hardcoded values in source code
  - [ ] Different keys for dev/staging/production

- [ ] **JWT Validation**
  - [ ] All protected routes validate JWT
  - [ ] JWT expires after reasonable time
  - [ ] JWT verification happens on server side
  - [ ] User ID extracted from token, not from request body

---

### Runtime Security Checks

While the application is running:

- [ ] **Network Security**
  - [ ] All API calls use HTTPS (no HTTP)
  - [ ] JWT tokens sent in `Authorization` header
  - [ ] JWT tokens not in URL parameters

- [ ] **User Isolation**
  - [ ] Users can only see their own data
  - [ ] User ID always extracted from JWT
  - [ ] No cross-user data access possible

- [ ] **Error Handling**
  - [ ] Error messages don't leak sensitive data
  - [ ] Stack traces not exposed to clients
  - [ ] Generic errors for auth failures

---

## Troubleshooting

### Issue 1: "Invalid API Key" Error

**Symptoms**:
```
supabase.errors.ApiError: Invalid API key
```

**Solutions**:
1. Verify `SUPABASE_URL` is correct (starts with `https://`)
2. Check `SUPABASE_ANON_KEY` or `SERVICE_ROLE_KEY` is copied correctly
3. Ensure no extra spaces in `.env` file
4. Restart FastAPI server after changing `.env`

**Check**:
```bash
python -c "from src.config import settings; print(settings.supabase_url)"
```

---

### Issue 2: CORS Errors in Frontend

**Symptoms**:
```
Access to fetch at 'http://localhost:8000/api/todos' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solutions**:
1. Add frontend origin to `CORS_ORIGINS` in `.env`:
   ```env
   CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
   ```
2. Ensure FastAPI CORS middleware is configured (future task)
3. Check for typos in frontend URL

---

### Issue 3: Environment Variables Not Loading

**Symptoms**:
```
pydantic.ValidationError: Field required [type=missing, ...]
```

**Solutions**:
1. Verify `.env` file exists in `backend/` directory
2. Check variable names match exactly (case-insensitive, but no typos)
3. Ensure no extra quotes around values:
   ```env
   # ✅ Correct
   SUPABASE_URL=https://xyz.supabase.co

   # ❌ Wrong (no quotes)
   SUPABASE_URL="https://xyz.supabase.co"
   ```
4. Run: `python -c "from src.config import settings; print(settings.dict())"`

---

### Issue 4: JWT Verification Failing

**Symptoms** (when implementing auth later):
```
HTTPException: Invalid token
```

**Solutions**:
1. Ensure using `service_role_key` for JWT verification (not `anon_key`)
2. Check token format: `Authorization: Bearer <token>`
3. Verify token hasn't expired
4. Test token at [https://jwt.io](https://jwt.io) to decode and inspect

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Python Client**: https://supabase.com/docs/reference/python
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **JWT Verification**: https://supabase.com/docs/guides/auth/server-side-rendering
- **FastAPI Security**: https://fastapi.tiangolo.com/tutorial/security/

---

## Summary

✅ **Completed in this task**:
- Supabase project setup instructions
- Environment configuration module (`config.py`)
- `.env` and `.env.example` files
- API key security model documentation
- FastAPI integration pattern (foundational)

⏭️ **Next task (TASK-P2-004)**:
- Database schema creation
- Row Level Security (RLS) policies
- Migration scripts

🔒 **Remember**: Never commit `.env` file, never expose `service_role_key` in frontend, always validate JWT tokens on server side.

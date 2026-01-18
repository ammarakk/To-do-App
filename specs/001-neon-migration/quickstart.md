# Quickstart Guide: Phase II-N Implementation

**Feature**: 001-neon-migration
**Last Updated**: 2026-01-18
**Estimated Time**: 4-6 hours for complete migration

---

## Prerequisites

### Required Tools
- **Python**: 3.13+ ([Download](https://www.python.org/downloads/))
- **Node.js**: 20+ ([Download](https://nodejs.org/))
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Neon Account**: Free tier at [neon.tech](https://neon.tech)
- **Railway/Render Account**: Free tier (for backend deployment)

### Required Accounts
- [Neon Console](https://console.neon.tech) - Database hosting
- [Vercel Account](https://vercel.com) - Frontend deployment
- [Railway](https://railway.app) or [Render](https://render.com) - Backend deployment

---

## Phase 1: Database Setup (15 minutes)

### Step 1.1: Create Neon PostgreSQL Database

```bash
# Install Neon CLI
npm install -g neonctl

# Login to Neon
neonctl auth

# Create new project
neonctl projects create --name "todo-app-neon"

# Create database
neonctl databases create --name "tododb"

# Get connection string (save this!)
neonctl connection-string --database-name tododb
```

**Expected Output**:
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/tododb?sslmode=require
```

### Step 1.2: Test Database Connection

```bash
# Install psql if needed
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Test connection
psql "postgresql://username:password@ep-xxx.region.aws.neon.tech/tododb?sslmode=require"

# You should see:
# tododb=>
```

### Step 1.3: Create Environment File

```bash
# In repository root
cp .env.example .env.local
```

**Add to `.env.local`**:
```env
# Database
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/tododb?sslmode=require"

# JWT Secret (generate secure random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"
```

---

## Phase 2: Backend Setup (45 minutes)

### Step 2.1: Create Backend Directory Structure

```bash
cd backend

# Create directories
mkdir -p src/{models,schemas,services,api/routes,core,utils}
mkdir -p tests/{unit,integration}
mkdir -p alembic/versions
```

### Step 2.2: Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn[standard]
pip install sqlalchemy[asyncio] asyncpg
pip install alembic
pip install pydantic[email]
pip install python-jose[cryptography]
pip install passlib[bcrypt]
pip install python-multipart
pip install pytest pytest-asyncio httpx
pip install python-dotenv
```

### Step 2.3: Configure Database Connection

**Create `backend/src/core/database.py`**:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_size=20,
    max_overflow=10
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### Step 2.4: Initialize Alembic Migrations

```bash
cd backend

# Initialize Alembic
alembic init alembic

# Edit alembic.ini to use async DATABASE_URL
# Replace sqlalchemy.url with:
# sqlalchemy.url = driver://user:pass@localhost/dbname

# Generate initial migration
alembic revision --autogenerate -m "Initial schema"

# Run migration
alembic upgrade head
```

### Step 2.5: Test Backend Server

**Create `backend/src/api/main.py`**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Todo API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Run server**:
```bash
cd backend
python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

**Test endpoint**:
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","database":"connected"}
```

---

## Phase 3: Frontend Migration (1 hour)

### Step 3.1: Remove Supabase Dependencies

```bash
cd frontend

# Uninstall Supabase packages
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs

# Install new dependencies
npm install axios
npm install swr  # For data fetching
```

### Step 3.2: Create API Client

**Create `frontend/src/lib/api-client.ts`**:
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies
});

// Request interceptor: Add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 (refresh token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Step 3.3: Update Auth Utilities

**Replace `frontend/src/lib/auth-utils.ts`**:
```typescript
import api from './api-client';

export interface User {
  id: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export async function signup(email: string, password: string) {
  const response = await api.post('/auth/signup', {
    email,
    password,
    confirm_password: password,
  });

  const { access_token, refresh_token, user } = response.data;

  // Store tokens
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
}

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });

  const { access_token, refresh_token, user } = response.data;

  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.clear();
    window.location.href = '/login';
  }
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}
```

### Step 3.4: Update Environment Variables

**Edit `frontend/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Step 3.5: Test Frontend

```bash
cd frontend

# Start development server
npm run dev

# Navigate to http://localhost:3000
# You should see the landing page
```

---

## Phase 4: Remove Supabase References (30 minutes)

### Step 4.1: Find All Supabase References

```bash
# Search frontend code
cd frontend
grep -r "supabase" src/ --include="*.ts" --include="*.tsx"
```

### Step 4.2: Remove Files

```bash
# Delete Supabase client
rm src/lib/supabase.ts

# Remove Supabase middleware
rm src/middleware.ts
# Or update it to use JWT validation instead

# Remove Supabase config from next.config.ts
```

### Step 4.3: Update Components

**Example: LoginForm.tsx**
```typescript
// Before: Supabase auth
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// After: Custom API
const user = await login(email, password);
```

### Step 4.4: Verify Removal

```bash
# Final check - should return no results
grep -r "supabase" src/ --include="*.ts" --include="*.tsx"

# Also check package.json
cat package.json | grep -i supabase
```

---

## Phase 5: UI Modernization (1-2 hours)

### Step 5.1: Update Tailwind Config

**Edit `frontend/tailwind.config.ts`**:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon-inspired palette
        neon: {
          cyan: '#00f3ff',
          magenta: '#ff00ff',
          purple: '#bd00ff',
          green: '#00ff9f',
        },
        // Dark theme base
        dark: {
          bg: '#0a0a0f',
          surface: '#12121a',
          border: '#1e1e2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.3)',
        'neon-magenta': '0 0 20px rgba(255, 0, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Step 5.2: Update Global Styles

**Edit `frontend/src/app/globals.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-dark-bg text-white antialiased;
  }
}

@layer components {
  .btn-neon {
    @apply px-6 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply hover:shadow-neon-cyan hover:scale-105;
  }

  .btn-primary {
    @apply bg-neon-cyan text-dark-bg;
  }

  .btn-secondary {
    @apply bg-transparent border-2 border-neon-magenta text-neon-magenta;
    @apply hover:bg-neon-magenta hover:text-white hover:shadow-neon-magenta;
  }

  .card-dark {
    @apply bg-dark-surface border border-dark-border rounded-xl;
    @apply shadow-lg hover:shadow-xl transition-all duration-300;
  }

  .input-dark {
    @apply bg-dark-bg border border-dark-border rounded-lg;
    @apply px-4 py-3 text-white placeholder-gray-500;
    @apply focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan;
  }
}
```

### Step 5.3: Update Landing Page

**Edit `frontend/src/app/page.tsx`**:
```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple bg-clip-text text-transparent">
            Evolution of Todo
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            A modern, AI-powered task management system built for the future
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="btn-neon btn-primary">
              Get Started Free
            </Link>
            <Link href="/login" className="btn-neon btn-secondary">
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-dark p-8 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-neon-cyan text-4xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Built with Next.js 16 and FastAPI for instant response times.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    description: 'JWT authentication with encrypted data storage.',
  },
  {
    icon: '🎨',
    title: 'Beautiful Design',
    description: 'Modern neon-inspired UI that looks great on any device.',
  },
];
```

---

## Phase 6: Testing (30 minutes)

### Step 6.1: Test Authentication Flow

```bash
# Start backend
cd backend
python -m uvicorn src.api.main:app --reload

# Start frontend (new terminal)
cd frontend
npm run dev
```

**Manual Test Checklist**:
- [ ] Visit http://localhost:3000
- [ ] Click "Get Started Free"
- [ ] Sign up with test@example.com / Test1234
- [ ] Verify redirect to dashboard
- [ ] Logout
- [ ] Login again with same credentials
- [ ] Verify dashboard loads with todos

### Step 6.2: Test Todo CRUD

**Using API directly**:
```bash
# Login to get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Save access_token from response

# Create todo
curl -X POST http://localhost:8000/api/v1/todos \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test todo","description":"Testing API"}'

# List todos
curl http://localhost:8000/api/v1/todos \
  -H "Authorization: Bearer <access_token>"

# Update todo
curl -X PUT http://localhost:8000/api/v1/todos/<todo_id> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete todo
curl -X DELETE http://localhost:8000/api/v1/todos/<todo_id> \
  -H "Authorization: Bearer <access_token>"
```

### Step 6.3: Test Security

```bash
# Test 1: Try to access without token (should fail)
curl http://localhost:8000/api/v1/todos

# Test 2: Create two users, verify data isolation
# User A creates todo → User B shouldn't see it

# Test 3: Try to access other user's todo (should fail 404)
curl http://localhost:8000/api/v1/todos/<other_user_todo_id> \
  -H "Authorization: Bearer <user_b_token>"
```

---

## Phase 7: Deployment (1 hour)

### Step 7.1: Deploy Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL database (or use Neon connection string)
railway add postgresql

# Set environment variables
railway variables set DATABASE_URL="your-neon-connection-string"
railway variables set JWT_SECRET="your-production-jwt-secret"

# Deploy
railway up

# Get API URL
railway domain
```

### Step 7.2: Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.railway.app/api/v1

# Deploy to production
vercel --prod
```

### Step 7.3: Post-Deployment Testing

```bash
# Test health endpoint
curl https://your-backend.railway.app/health

# Test frontend
open https://your-frontend.vercel.app

# Run through full user flow:
# 1. Signup
# 2. Create todo
# 3. Logout/login
# 4. Verify everything works
```

---

## Troubleshooting

### Common Issues

**Issue**: "Database connection failed"
- **Solution**: Verify DATABASE_URL is correct, check SSL mode (should be `sslmode=require`)

**Issue**: "JWT validation error"
- **Solution**: Ensure JWT_SECRET is same on backend and frontend (frontend shouldn't have it, only backend)

**Issue**: "CORS error"
- **Solution**: Update CORS middleware in FastAPI to include your frontend URL

**Issue**: "401 Unauthorized on refresh"
- **Solution**: Check refresh token expiry, ensure refresh token is stored correctly

**Issue**: "Supabase still referenced"
- **Solution**: Run `grep -r "supabase"` to find remaining references

### Debug Mode

**Backend**:
```python
# In main.py, enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend**:
```typescript
// In api-client.ts, log all requests
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});
```

---

## Next Steps

1. ✅ **Complete Migration**: All phases done
2. **UI Polish**: Add more animations, icons, and micro-interactions
3. **Testing**: Add unit tests, integration tests, E2E tests
4. **Documentation**: Update README with new architecture
5. **Performance**: Add caching, optimize database queries
6. **Security**: Run security audit, implement rate limiting
7. **Monitoring**: Add error tracking (Sentry), analytics

---

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs
- **Neon Docs**: https://neon.tech/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **OpenAPI Spec**: `specs/001-neon-migration/contracts/openapi.yaml`

---

**Last Updated**: 2026-01-18
**Status**: Ready for implementation

# Quickstart Guide: Phase 2 - Multi-User Web Application

**Feature**: 001-phase2-web
**Last Updated**: 2026-01-17

## Overview

This guide helps you set up the development environment for Phase 2 of the Evolution of Todo project. You'll set up both the FastAPI backend and Next.js frontend, connect them to Supabase, and run the application locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.13+**: [Download here](https://www.python.org/downloads/)
- **Node.js LTS**: [Download here](https://nodejs.org/)
- **uv** (Python package manager): Install with `pip install uv` or follow [official guide](https://github.com/astral-sh/uv)
- **Git**: For version control
- **Supabase Account**: Free account at [supabase.com](https://supabase.com)
- **Code Editor**: VS Code recommended with Python and TypeScript extensions

---

## 1. Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click **"New Project"**
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name**: `todo-app` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your location
5. Click **"Create new project"** and wait for provisioning (~2 minutes)

### 1.2 Get Your Credentials

Once your project is ready:

1. Go to **Settings → API**
2. Copy these credentials (you'll need them later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1...`
   - **service_role key**: `eyJhbGciOiJIUzI1...` ⚠️ **NEVER share this or commit to git**

### 1.3 Enable Email Auth

1. Go to **Authentication → Providers**
2. Ensure **Email** provider is **enabled**
3. (Optional) Disable email confirmation for faster development:
   - Go to **Authentication → URL Configuration**
   - Uncheck **"Enable email confirmations"**
   - Click **Save**

### 1.4 Run Database Migration

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New Query"**
3. Copy the contents of `backend/migrations/001_create_todos_table.sql` (see data-model.md)
4. Paste and click **"Run"** to create the `todos` table and enable RLS

---

## 2. Backend Setup (FastAPI)

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Create Virtual Environment and Install Dependencies

```bash
# Install uv if not already installed
pip install uv

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install fastapi uvicorn supabase pydantic python-dotenv python-multipart pytest pytest-asyncio httpx
```

### 2.3 Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Backend Configuration
API_HOST=localhost
API_PORT=8000
CORS_ORIGINS=http://localhost:3000

# Environment
ENVIRONMENT=development
```

**⚠️ SECURITY WARNING**:
- Never commit `.env` files to git
- Use `service_role` key for backend only (never expose to frontend)
- Use `anon` key for frontend only

### 2.4 Verify Backend Setup

```bash
# Run the FastAPI server
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/docs` to see the interactive API documentation (Swagger UI).

**Expected Output**:
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### 2.5 Run Backend Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html
```

---

## 3. Frontend Setup (Next.js)

### 3.1 Navigate to Frontend Directory

Open a new terminal:

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
# Install Node.js dependencies
npm install
```

Expected dependencies (from `package.json`):
- `next`: 16+ (App Router)
- `react`: Latest
- `react-dom`: Latest
- `typescript`: 5+
- `@supabase/supabase-js`: Latest
- `tailwindcss`: 3+
- `@hookform/resolvers`: For form validation
- `react-hook-form`: For form management
- `zod`: For schema validation
- `jest`: For testing
- `@testing-library/react`: For component testing

### 3.3 Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
# Supabase Configuration (Public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Environment
NEXT_PUBLIC_APP_ENV=development
```

**⚠️ SECURITY**:
- `NEXT_PUBLIC_` variables are exposed to the browser
- Use `anon` key (safe for public clients)
- NEVER use `service_role` key in frontend

### 3.4 Run Development Server

```bash
# Start Next.js development server
npm run dev
```

Visit `http://localhost:3000` to see the frontend application.

**Expected Output**:
- Landing page with "Login" and "Sign Up" buttons
- Responsive layout (try resizing browser)

### 3.5 Run Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 4. Development Workflow

### 4.1 Start Both Servers

Open two terminals:

**Terminal 1 (Backend)**:
```bash
cd backend
source .venv/bin/activate
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### 4.2 Typical Development Flow

1. **Backend Changes**:
   - Edit files in `backend/src/`
   - FastAPI auto-reloads on save
   - Check API docs at `http://localhost:8000/docs`
   - Run tests: `uv run pytest`

2. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Next.js hot-reloads on save
   - Check browser console for errors
   - Run tests: `npm test`

3. **Database Changes**:
   - Use Supabase SQL Editor for migrations
   - Save migration scripts in `backend/migrations/`
   - Test RLS policies with multiple users

### 4.3 Debugging Tips

**Backend Debugging**:
- Use `print()` statements for quick debugging
- Use VS Code Python debugger (set breakpoints)
- Check API responses at `http://localhost:8000/docs`
- View logs in terminal where FastAPI is running

**Frontend Debugging**:
- Use browser DevTools (F12)
- Check Console for errors
- Use React DevTools extension
- Use Network tab to see API requests

**Database Debugging**:
- Use Supabase Table Editor to view data
- Use SQL Editor to run queries
- Check Auth logs for failed login attempts
- Verify RLS policies are enabled

---

## 5. Testing the Application

### 5.1 Test Authentication Flow

1. **Sign Up**:
   - Go to `http://localhost:3000/signup`
   - Enter email and password
   - Submit form
   - Should redirect to dashboard

2. **Log Out**:
   - Click logout button in dashboard
   - Should redirect to login page

3. **Log In**:
   - Go to `http://localhost:3000/login`
   - Enter same email and password
   - Should redirect to dashboard

### 5.2 Test CRUD Operations

1. **Create Todo**:
   - Click "Add Todo" button
   - Fill in title, description, priority, due date
   - Submit form
   - Should see new todo in list

2. **Read Todos**:
   - View todo list on dashboard
   - Should see all your todos
   - Pagination should work if > 20 todos

3. **Update Todo**:
   - Click edit button on a todo
   - Modify fields
   - Save changes
   - Should see updated todo

4. **Delete Todo**:
   - Click delete button on a todo
   - Confirm deletion
   - Todo should disappear from list

### 5.3 Test User Isolation

1. **User A**:
   - Sign up with `user-a@example.com`
   - Create a few todos

2. **User B**:
   - Open incognito/private browser window
   - Sign up with `user-b@example.com`
   - Should NOT see User A's todos

3. **Security Check**:
   - Try to access User A's todo ID while logged in as User B
   - Should get 403 Forbidden error

---

## 6. Common Issues and Solutions

### Issue 1: CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Solution**:
```bash
# Check backend/.env
CORS_ORIGINS=http://localhost:3000

# Restart backend after changing .env
```

### Issue 2: JWT Validation Fails

**Symptom**: 401 Unauthorized on API requests

**Solutions**:
- Verify JWT is being sent in `Authorization: Bearer <token>` header
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct in backend `.env`
- Ensure JWT hasn't expired (1 hour expiry)

### Issue 3: Database Connection Failed

**Symptom**: Backend logs show Supabase connection errors

**Solutions**:
- Verify `SUPABASE_URL` is correct in backend `.env`
- Check Supabase project is active (not paused)
- Ensure RLS policies are enabled

### Issue 4: Frontend Build Errors

**Symptom**: TypeScript or build errors in Next.js

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Check TypeScript errors
npm run type-check
```

### Issue 5: Tests Failing

**Symptom**: Backend or frontend tests fail

**Solutions**:
```bash
# Backend: Ensure virtual environment is activated
source .venv/bin/activate
uv run pytest -v  # Verbose output

# Frontend: Run tests with verbose output
npm test -- --verbose
```

---

## 7. Environment Variables Reference

### Backend (.env)

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (defaults shown)
API_HOST=localhost
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### Frontend (.env.local)

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional (defaults shown)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

---

## 8. Production Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub repository
2. Create account on [Railway](https://railway.app) or [Render](https://render.com)
3. Connect GitHub repository
4. Add environment variables (use production Supabase credentials)
5. Deploy!

### Frontend Deployment (Vercel)

1. Push code to GitHub repository
2. Create account on [Vercel](https://vercel.com)
3. Import repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Post-Deployment Checklist

- [ ] Update CORS origins to production domain
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Run database migrations on production Supabase
- [ ] Test auth flow with production URLs
- [ ] Test user isolation with production database
- [ ] Monitor logs for errors

---

## 9. Next Steps

After setting up the development environment:

1. **Review the Architecture**:
   - Read `plan.md` for implementation phases
   - Read `data-model.md` for database schema
   - Read `contracts/openapi.yaml` for API endpoints

2. **Start Implementation**:
   - Run `/sp.tasks` to generate detailed tasks
   - Run `/sp.implement` to execute tasks via agents

3. **Follow Development Rules**:
   - No manual coding—all work via prompts and agents
   - Sequential phase execution (no parallel work)
   - All implementations tied to Task IDs

---

## 10. Resources

- **FastAPI Docs**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Pydantic**: [docs.pydantic.dev](https://docs.pydantic.dev/)

---

## Support

If you encounter issues not covered in this guide:

1. Check the [research.md](./research.md) for best practices
2. Review the [data-model.md](./data-model.md) for schema details
3. Consult the [plan.md](./plan.md) for architecture decisions

**Happy coding! 🚀**

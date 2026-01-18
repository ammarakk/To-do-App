# Complete Setup Guide - Phase II-N Migration

## Overview

This guide provides step-by-step instructions to set up and test the Todo application after the Phase II-N migration from Supabase to Neon PostgreSQL + custom JWT authentication.

**Prerequisites**:
- Node.js 18+ installed
- Python 3.11+ installed
- Git installed
- Neon.tech account (free tier available)

---

## Part 1: Backend Setup

### Step 1.1: Create Neon Database

1. **Sign up for Neon**:
   - Go to https://neon.tech
   - Click "Sign Up" (use GitHub, Google, or email)
   - Verify your email if required

2. **Create a new project**:
   - Click "Create a project"
   - Project name: `todo-app` (or your preferred name)
   - Select region: Choose closest to your users
   - PostgreSQL version: Default (15 or later)
   - Click "Create project"

3. **Get connection string**:
   - Once created, you'll see a dashboard
   - Click "Connection details" or look for "Connection string"
   - Copy the connection string (looks like):
     ```
     postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
     ```
   - **IMPORTANT**: Save this string - you'll need it for the .env file

### Step 1.2: Configure Backend Environment

1. **Create .env file**:
   ```bash
   cd backend
   ```

2. **Create or edit .env file**:
   ```bash
   # Database Configuration (Neon PostgreSQL)
   DATABASE_URL=your_neon_connection_string_here

   # JWT Configuration
   JWT_SECRET_KEY=generate_with_openssl
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # API Configuration
   API_HOST=0.0.0.0
   API_PORT=8000
   DEBUG_MODE=true

   # CORS Configuration
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

3. **Generate JWT_SECRET_KEY** (Windows):
   ```powershell
   # Open PowerShell or Command Prompt
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

   Or use OpenSSL:
   ```bash
   openssl rand -hex 32
   ```

4. **Verify .env file**:
   ```bash
   # Check file exists
   ls .env

   # View contents (without exposing secret)
   cat .env | head -1
   ```

### Step 1.3: Install Backend Dependencies

1. **Navigate to backend**:
   ```bash
   cd backend
   ```

2. **Activate virtual environment**:
   ```bash
   # Windows
   .venv\Scripts\activate

   # Linux/Mac
   source .venv/bin/activate
   ```

3. **Verify dependencies are installed**:
   ```bash
   pip list | grep -E "(fastapi|sqlalchemy|alembic|jose|passlib)"
   ```

   If not installed, run:
   ```bash
   pip install -e .
   ```

### Step 1.4: Generate and Run Database Migrations

1. **Generate initial migration**:
   ```bash
   # Make sure you're in the backend directory
   cd backend

   # Generate migration
   python -m alembic revision --autogenerate -m "Initial schema"
   ```

   Expected output:
   ```
   INFO  [alembic.runtime] Generating /path/to/alembic_migrations/versions/xxx_initial_schema.py... done
   ```

2. **Review generated migration** (optional):
   ```bash
   # View migration file
   # Windows
   alembic_migrations\versions\dir

   # Linux/Mac
   ls alembic_migrations/versions/
   ```

3. **Run migration**:
   ```bash
   python -m alembic upgrade head
   ```

   Expected output:
   ```
   INFO  [alembic.runtime] Running upgrade-> xxx_initial_schema
   INFO  [alembic.runtime] Creating tables...
   INFO  [alembic.runtime] Done!
   ```

### Step 1.5: Test Backend Server

1. **Start backend server**:
   ```bash
   python -m uvicorn src.main:app --reload
   ```

   Expected output:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
   INFO:     Started reloader process [xxxxx] using StatReload
   INFO:     Started server process [xxxxx]
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   ✅ Database connection initialized
   ```

2. **Open API documentation**:
   - Open browser to http://localhost:8000/docs
   - You should see FastAPI's automatic API documentation
   - Verify endpoints are visible:
     - POST /api/auth/signup
     - POST /api/auth/login
     - POST /api/auth/refresh
     - POST /api/auth/logout
     - GET /api/auth/me
     - POST /api/todos
     - GET /api/todos
     - GET /api/todos/{todo_id}
     - PUT /api/todos/{todo_id}
     - DELETE /api/todos/{todo_id}
     - PATCH /api/todos/{todo_id}/complete

3. **Test health endpoint**:
   - Open http://localhost:8000/health in browser
   - Expected response:
     ```json
     {
       "status": "healthy",
       "service": "todo-api",
       "version": "2.0.0",
       "database": "connected"
     }
     ```

4. **Stop server** (press `CTRL+C` when done testing)

---

## Part 2: Frontend Setup

### Step 2.1: Configure Frontend Environment

1. **Create or edit .env.local**:
   ```bash
   cd frontend
   ```

2. **Create .env.local file**:
   ```bash
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Verify .env.local**:
   ```bash
   ls .env.local
   cat .env.local
   ```

### Step 2.2: Install Frontend Dependencies

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Verify key dependencies**:
   ```bash
   npm list | grep -E "(axios|swr|next)"
   ```

### Step 2.3: Test Frontend Server

1. **Start frontend dev server**:
   ```bash
   npm run dev
   ```

   Expected output:
   ```
   ▲ Next.js 15.1.7
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

   ✓ Ready in 2.3s
   ```

2. **Open application**:
   - Open browser to http://localhost:3000
   - You should see the Todo application
   - Note: The UI shows placeholder styling but is functional

3. **Stop server** (press `CTRL+C` when done testing)

---

## Part 3: End-to-End Testing

### Test 3.1: User Signup Flow

1. **Ensure both servers are running**:
   - Backend: `cd backend && python -m uvicorn src.main:app --reload`
   - Frontend: `cd frontend && npm run dev`

2. **Navigate to signup page**:
   - Open http://localhost:3000/signup
   - Fill in the form:
     - Email: `test@example.com`
     - Password: `testpass123` (must be 8+ characters)

3. **Submit signup**:
   - Click "Sign Up" button
   - Expected: Redirect to /todos
   - Check browser console (F12) for any errors
   - Check localStorage (F12 → Application → Local Storage):
     - Should contain: `access_token`, `refresh_token`, `user`, `token_expiry`

### Test 3.2: User Login Flow

1. **Logout if logged in**:
   - Click logout button if visible
   - Or manually clear localStorage

2. **Navigate to login page**:
   - Open http://localhost:3000/login

3. **Fill in login form**:
   - Email: `test@example.com` (use the email from signup)
   - Password: `testpass123`

4. **Submit login**:
   - Click "Sign In" button
   - Expected: Redirect to /todos
   - Check localStorage for tokens

### Test 3.3: Create Todo

1. **Navigate to todos page**:
   - Should be at http://localhost:3000/todos

2. **Create a new todo**:
   - Look for "Add Todo" or "Create Todo" button
   - Fill in:
     - Title: `Test todo from setup guide`
     - Description: `This is a test todo`
     - Priority: Select "High"
   - Click submit

3. **Verify todo created**:
   - Todo should appear in list
   - Check browser network tab (F12 → Network):
     - Look for POST /api/todos request
     - Should return 201 status
     - Response should contain todo data

### Test 3.4: List Todos with Pagination

1. **Create multiple todos** (5-10 items) to test pagination

2. **Verify pagination**:
   - If using pagination, verify page numbers appear
   - Navigate between pages

3. **Test filters** (if UI supports):
   - Status filter (pending, in_progress, completed)
   - Priority filter (low, medium, high)
   - Search functionality

### Test 3.5: Update Todo

1. **Edit a todo**:
   - Click on a todo to edit
   - Modify title or description
   - Change status to "completed"
   - Save changes

2. **Verify update**:
   - Check network tab for PUT /api/todos/{id} request
   - Should return 200 status
   - Todo should be updated in list

### Test 3.6: Mark as Completed

1. **Find a pending todo**

2. **Mark as completed** (if separate from update):
   - Click "Complete" or checkbox
   - Check network tab for PATCH /api/todos/{id}/complete
   - Should return 200 status

### Test 3.7: Delete Todo

1. **Find a todo to delete**

2. **Delete it**:
   - Click delete button/trash icon
   - Confirm deletion if prompted

3. **Verify deletion**:
   - Check network tab for DELETE /api/todos/{id}
   - Should return 200 status
   - Todo should disappear from list

### Test 3.8: Token Refresh

1. **Wait for access token to expire** (15 minutes) OR:
   - Manually modify `access_token` in localStorage to simulate expiry
   - Open F12 → Application → Local Storage
   - Edit `token_expiry` to a past timestamp

2. **Make an API call**:
   - Refresh the page or navigate to todos
   - Should automatically refresh token
   - Check network tab for POST /api/auth/refresh
   - Should see new tokens in localStorage

3. **Verify session still active**:
   - You should remain logged in
   - No redirect to login page

### Test 3.9: Logout

1. **Click logout button**

2. **Verify logout**:
   - Check network tab for POST /api/auth/logout
   - Should return 200 status
   - localStorage should be cleared
   - Should redirect to /login

---

## Part 4: Backend API Testing (with Swagger UI)

### Test 4.1: Test Signup via API Docs

1. **Open API docs**:
   - Go to http://localhost:8000/docs

2. **Test POST /api/auth/signup**:
   - Click on the endpoint
   - Click "Try it out"
   - Fill in request body:
     ```json
     {
       "email": "swagger-test@example.com",
       "password": "testpass123"
     }
     ```
   - Click "Execute"
   - Verify response (201 status with tokens and user info)

3. **Save the tokens**:
   - Copy the `access_token` from response
   - Click "Authorize" button (top right)
   - Enter: `Bearer <your_access_token>`
   - Click "Authorize"

### Test 4.2: Test GET /api/auth/me

1. **Use GET /api/auth/me**:
   - Click "Try it out"
   - Click "Execute"
   - Should return user info

### Test 4.3: Test Todo CRUD

1. **Create todo**:
   - POST /api/todos
   - Request body:
     ```json
     {
       "title": "Swagger test todo",
       "description": "Created via API docs",
       "priority": "high"
     }
     ```

2. **Get todos**:
   - GET /api/todos
   - Should return list with your todo

3. **Get specific todo**:
   - Copy todo ID from previous response
   - GET /api/todos/{todo_id}

4. **Update todo**:
   - PUT /api/todos/{todo_id}
   - Request body:
     ```json
     {
       "status": "completed"
     }
     ```

5. **Mark completed**:
   - PATCH /api/todos/{todo_id}/complete

6. **Delete todo**:
   - DELETE /api/todos/{todo_id}

---

## Part 5: Troubleshooting

### Issue 5.1: Backend Won't Start

**Problem**: `uvicorn` command not found

**Solution**:
```bash
# Make sure virtual environment is activated
cd backend
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

# Try running with full path
python -m uvicorn src.main:app --reload
```

### Issue 5.2: Database Connection Error

**Problem**: `connection refused` or `database does not exist`

**Solution**:
1. Verify DATABASE_URL in .env
2. Check Neon dashboard - is database active?
3. Verify you ran migrations: `python -m alembic upgrade head`
4. Check network connection

### Issue 5.3: Frontend Build Errors

**Problem**: TypeScript errors during build

**Solution**:
```bash
# Use dev mode instead (build has known prerendering issue)
npm run dev  # This works fine
```

### Issue 5.4: CORS Errors

**Problem**: Frontend can't connect to backend

**Solution**:
1. Check CORS_ORIGINS in backend .env
2. Should include: `http://localhost:3000`
3. Restart backend after changing .env

### Issue 5.5: 401 Unauthorized

**Problem**: API requests return 401

**Solution**:
1. Check localStorage has `access_token`
2. Verify token hasn't expired (check `token_expiry`)
3. Check Authorization header in network tab
4. Try logging out and back in

---

## Part 6: Verification Checklist

### Backend Verification
- [ ] Backend starts without errors
- [ ] Health endpoint returns healthy status
- [ ] API docs accessible at /docs
- [ ] Database migrations applied successfully
- [ ] All auth endpoints visible in Swagger
- [ ] All todo endpoints visible in Swagger

### Frontend Verification
- [ ] Frontend starts without errors
- [ ] Application loads in browser
- [ ] Signup page accessible
- [ ] Login page accessible
- [ ] Todos page accessible

### Integration Verification
- [ ] User signup works end-to-end
- [ ] User login works end-to-end
- [ ] Tokens stored in localStorage
- [ ] Can create todo from UI
- [ ] Can list todos
- [ ] Can update todo
- [ ] Can mark todo as completed
- [ ] Can delete todo
- [ ] Token refresh works automatically
- [ ] Logout clears tokens and redirects

### API Verification (via Swagger)
- [ ] POST /api/auth/signup works
- [ ] POST /api/auth/login works
- [ ] POST /api/auth/refresh works
- [ ] POST /api/auth/logout works
- [ ] GET /api/auth/me works
- [ ] POST /api/todos works
- [ ] GET /api/todos works
- [ ] GET /api/todos/{id} works
- [ ] PUT /api/todos/{id} works
- [ ] DELETE /api/todos/{id} works
- [ ] PATCH /api/todos/{id}/complete works

---

## Part 7: Common Issues and Solutions

### Database Migration Errors

**Error**: `Target database is not up to date`

**Solution**:
```bash
cd backend
python -m alembic upgrade head
```

### Port Already in Use

**Error**: `Address already in use` or `port 8000 already in use`

**Solution**:
```bash
# Find process using port 8000
netstat -ano | findstr :8000  # Windows
lsof -ti:8000  # Linux/Mac

# Kill the process
taskkill /PID <pid> /F  # Windows
kill -9 <pid>  # Linux/Mac

# Or use different port
python -m uvicorn src.main:app --port 8001
```

### JWT Secret Key Too Short

**Error**: `jwt_secret_key must be at least 32 characters`

**Solution**:
```bash
# Generate a new one
python -c "import secrets; print(secrets.token_hex(32))"

# Update backend/.env with new key
```

### Import Errors in Backend

**Error**: `ModuleNotFoundError: No module named 'xxx'`

**Solution**:
```bash
cd backend
pip install -e .
```

---

## Part 8: Next Steps After Setup

### After Successful Setup:

1. **Create more todos** to test pagination

2. **Test search functionality**:
   - Create todos with keywords in title/description
   - Use search to filter them

3. **Test filtering**:
   - Create todos with different priorities
   - Filter by priority
   - Filter by status
   - Filter by category

4. **Test user isolation**:
   - Create account with different email
   - Verify users can only see their own todos

5. **Test token expiry**:
   - Wait 15 minutes or manually expire token
   - Verify automatic refresh works

6. **Test error handling**:
   - Try to access todo with invalid ID
   - Try to create todo without title
   - Verify user-friendly error messages

---

## Part 9: Development Workflow

### Start Development Environment:

**Terminal 1 - Backend**:
```bash
cd backend
.venv\Scripts\activate
python -m uvicorn src.main:app --reload
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

**Browser**:
- Backend API docs: http://localhost:8000/docs
- Frontend app: http://localhost:3000
- Backend health: http://localhost:8000/health

### Common Development Tasks:

**Check logs**:
- Backend: Terminal shows uvicorn logs
- Frontend: Terminal shows Next.js logs
- Browser: F12 → Console tab for client logs

**Restart servers**:
- Backend: Auto-reloads on file changes (uvicorn --reload)
- Frontend: Auto-reloads on file changes (Next.js dev mode)

**Clear database** (if needed):
```bash
cd backend
# Delete migration files and start over
rm -rf alembic_migrations/versions/*
python -m alembic revision --autogenerate -m "Initial schema"
python -m alembic upgrade head
```

---

## Summary

This guide covers:
1. ✅ Neon database creation
2. ✅ Backend configuration and setup
3. ✅ Frontend configuration and setup
4. ✅ Database migrations
5. ✅ End-to-end testing
6. ✅ Troubleshooting common issues
7. ✅ Verification checklists

**Follow this guide completely and your Todo application will be fully functional!**

---

**Last Updated**: 2026-01-18
**Branch**: 001-professional-audit
**Status**: Ready for deployment

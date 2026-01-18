# Deployment Guide - Todo Application

## Overview

This guide covers deploying the Todo application after the Phase II-N migration to Neon PostgreSQL + custom JWT authentication.

**Architecture**:
- **Frontend**: Next.js 15 on Vercel
- **Backend**: FastAPI on Railway/Render/Fly.io
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Custom JWT with token rotation

---

## Prerequisites

Before deploying, ensure you have:
- [ ] Neon account and database created
- [ ] GitHub account (for Vercel/Railway deployments)
- [ ] Completed local testing per COMPLETE-SETUP-GUIDE.md
- [ ] Backend .env configured with DATABASE_URL and JWT_SECRET_KEY
- [ ] Frontend .env.local configured with NEXT_PUBLIC_API_URL

---

## Part 1: Database Deployment (Neon)

### Step 1.1: Create Production Database

1. **Go to Neon**: https://neon.tech
2. **Create account** (if not already created)
3. **Create new project**:
   - Project name: `todo-app-prod`
   - Region: Choose closest to your users
   - PostgreSQL version: Default (15+)
4. **Copy connection string**:
   ```
   postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
   ```

### Step 1.2: Run Database Migrations

**Option A: From local machine**:
```bash
cd backend

# Set production DATABASE_URL
export DATABASE_URL="your_production_neon_connection_string"

# Generate migration
python -m alembic revision --autogenerate -m "Production schema"

# Run migration
python -m alembic upgrade head
```

**Option B: Using Railway/Render**:
- PaaS platforms typically run migrations automatically
- Configure in deployment settings (see Part 2)

### Step 1.3: Configure Connection Pooling (Optional)

For production, enable Neon's connection pooling:
1. Go to Neon dashboard
2. Select your project
3. Enable "Connection Pooling"
4. Use pooled connection string in production:
   ```
   postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   ```

---

## Part 2: Backend Deployment

### Option A: Deploy to Railway (Recommended)

**Why Railway?**
- Built-in PostgreSQL support
- Simple GitHub integration
- Automatic HTTPS
- Free tier available
- Easy environment variable management

#### Step 2.1: Prepare Repository

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin 001-professional-audit
   ```

2. **Verify requirements.txt is up to date**:
   ```bash
   cat backend/requirements.txt
   ```

   Should include:
   ```
   fastapi==0.115.0
   uvicorn[standard]==0.32.0
   sqlalchemy==2.0.36
   asyncpg==0.29.0
   alembic==1.13.3
   python-jose[cryptography]==3.3.0
   passlib[bcrypt]==1.7.4
   python-multipart==0.0.12
   pydantic==2.9.2
   pydantic-settings==2.5.2
   ```

#### Step 2.2: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose repository**: `to-do-app`
6. **Select branch**: `001-professional-audit`
7. **Click "Deploy Now"**

#### Step 2.3: Configure Backend Service

1. **Root Directory**: Set to `backend`
2. **Builder**: Dockerfile (already configured in `railway.json`)
3. **Port**: 8000 (auto-detected)

#### Step 2.4: Add Environment Variables

In Railway dashboard, add these variables:

```bash
# Database
DATABASE_URL = (click "Add Database" → select Neon or paste connection string)

# JWT Configuration
JWT_SECRET_KEY = (click "Generate" → 64 characters)
JWT_ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# API Configuration
API_HOST = 0.0.0.0
API_PORT = 8000
DEBUG_MODE = false

# CORS (add your Vercel domain)
CORS_ORIGINS = https://your-vercel-domain.vercel.app,https://localhost:3000
```

#### Step 2.5: Configure Database Migrations

Railway doesn't auto-run Alembic migrations. Add a `Procfile`:

```bash
# Create backend/Procfile
web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
release: python -m alembic upgrade head
```

Railway will run the `release` command on each deployment.

#### Step 2.6: Verify Deployment

1. **Check deployment logs** for errors
2. **Visit Railway URL**: `https://your-service.up.railway.app/docs`
3. **Test health endpoint**: `https://your-service.up.railway.app/health`
4. **Test signup** via Swagger UI

**Expected response**:
```json
{
  "status": "healthy",
  "service": "todo-api",
  "version": "2.0.0",
  "database": "connected"
}
```

#### Step 2.7: Set Custom Domain (Optional)

1. In Railway dashboard → Settings → Domains
2. Add custom domain (e.g., `api.yourdomain.com`)
3. Update DNS records per Railway instructions
4. Update `CORS_ORIGINS` with new domain

---

### Option B: Deploy to Render

**Why Render?**
- Generous free tier
- Automatic SSL
- Built-in PostgreSQL
- Easy environment variable management

#### Step 2.1: Create Render Account

1. Go to https://render.com
2. Sign up/login with GitHub

#### Step 2.2: Deploy Web Service

1. **Click "New +" → "Web Service"**
2. **Connect GitHub repository**
3. **Configure service**:
   - **Name**: `todo-app-backend`
   - **Environment**: Python 3
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

#### Step 2.3: Add Environment Variables

In Render dashboard → Environment tab, add:

```bash
DATABASE_URL = (paste Neon connection string)
JWT_SECRET_KEY = (generate with: openssl rand -hex 32)
JWT_ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
DEBUG_MODE = false
CORS_ORIGINS = https://your-vercel-domain.vercel.app
```

#### Step 2.4: Configure Database Migrations

Create `render-build.sh` in backend directory:

```bash
#!/bin/bash
# Run migrations on deployment
python -m alembic upgrade head
```

Update Build Command to:
```bash
pip install -r requirements.txt && bash render-build.sh
```

---

### Option C: Deploy to Fly.io

**Why Fly.io?**
- Global deployment
- Built-in edge network
- Docker-native

#### Step 2.1: Install Fly CLI

```bash
# Windows
powershell -c "irm https://fly.io/install.ps1 | iex"

# Linux/Mac
curl -L https://fly.io/install.sh | sh
```

#### Step 2.2: Authenticate

```bash
fly auth login
```

#### Step 2.3: Deploy

```bash
cd backend
fly launch
```

Follow prompts to configure:
- App name: `todo-app-backend`
- Region: Choose closest to users
- Deploy: Yes

#### Step 2.4: Set Secrets

```bash
fly secrets set DATABASE_URL="your_neon_connection_string"
fly secrets set JWT_SECRET_KEY="your_64_char_key"
fly secrets set JWT_ALGORITHM="HS256"
fly secrets set ACCESS_TOKEN_EXPIRE_MINUTES="15"
fly secrets set REFRESH_TOKEN_EXPIRE_DAYS="7"
fly secrets set DEBUG_MODE="false"
fly secrets set CORS_ORIGINS="https://your-vercel-domain.vercel.app"
```

---

## Part 3: Frontend Deployment (Vercel)

### Step 3.1: Prepare Repository

1. **Fix production build issue** (from KNOWN-ISSUES.md):

Add to `frontend/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true  // Required for static export
  }
}

module.exports = nextConfig
```

2. **Update .env.local for production**:

Create `frontend/.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

3. **Test production build locally**:
```bash
cd frontend
npm run build
npm run start  # Test production build
```

### Step 3.2: Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. **Go to Vercel**: https://vercel.com
2. **Sign up/login** with GitHub
3. **Click "New Project"**
4. **Import repository**: `to-do-app`
5. **Configure project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (or `out` if using static export)

6. **Add environment variables**:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.railway.app
   ```

7. **Click "Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

Follow prompts to configure deployment.

### Step 3.3: Configure Custom Domain (Optional)

1. **In Vercel Dashboard** → Settings → Domains
2. **Add domain** (e.g., `todo.yourdomain.com`)
3. **Configure DNS**:
   - Type: `CNAME`
   - Name: `todo` (or `@` for root)
   - Value: `cname.vercel-dns.com`

### Step 3.4: Update CORS Configuration

Once Vercel domain is assigned, update backend CORS_ORIGINS:

**On Railway**:
```bash
CORS_ORIGINS = https://your-todo-app.vercel.app,https://custom-domain.com
```

**Re-deploy backend** to apply changes.

### Step 3.5: Verify Deployment

1. **Visit Vercel URL**: `https://your-app.vercel.app`
2. **Test signup flow**
3. **Test login**
4. **Test create todo**
5. **Check browser console** for errors
6. **Test token refresh** (wait 15 minutes or manually expire token)

---

## Part 4: Post-Deployment Testing

### Test 4.1: Health Endpoints

**Backend**:
```bash
curl https://your-backend.railway.app/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "todo-api",
  "version": "2.0.0",
  "database": "connected"
}
```

**Frontend**:
- Visit homepage
- Should load without errors
- Check browser console (F12)

### Test 4.2: Authentication Flow

1. **Sign up**:
   - Visit `/signup`
   - Create new account
   - Should redirect to `/todos`

2. **Verify tokens**:
   - Open DevTools → Application → Local Storage
   - Should see: `access_token`, `refresh_token`, `user`, `token_expiry`

3. **Login**:
   - Logout
   - Login again
   - Should work correctly

4. **Token refresh**:
   - Wait 15 minutes OR manually modify `token_expiry` to past
   - Navigate around app
   - Should automatically refresh (no redirect to login)

### Test 4.3: Todo CRUD

1. **Create todo**:
   - Click "Add Todo"
   - Fill form
   - Submit
   - Should appear in list

2. **List todos**:
   - Create 5-10 todos
   - Verify pagination
   - Test search
   - Test filters

3. **Update todo**:
   - Edit a todo
   - Change status
   - Save
   - Should update

4. **Delete todo**:
   - Delete a todo
   - Should disappear

### Test 4.4: User Isolation

1. **Create two accounts**:
   - User A: `user1@example.com`
   - User B: `user2@example.com`

2. **Create todos as User A**

3. **Logout, login as User B**

4. **Verify User B cannot see User A's todos**

---

## Part 5: Monitoring and Maintenance

### Backend Monitoring

**Railway**:
- Dashboard shows metrics
- Check deployment logs
- Set up alerts (Settings → Notifications)

**Vercel Analytics** (Frontend):
- Dashboard → Analytics
- View page views, performance
- Monitor errors

### Log Aggregation

**Railway Logs**:
```bash
# View logs via CLI
railway logs

# View specific service
railway logs --service todo-app-backend
```

### Database Monitoring

**Neon Dashboard**:
- Metrics: CPU, memory, storage
- Active connections
- Query performance
- Slow query log

### Health Checks

Set up external monitoring (optional):
- **UptimeRobot**: Monitor `/health` endpoint
- **Pingdom**: Similar service
- **Better Uptime**: Open-source alternative

---

## Part 6: Security Checklist

### Backend Security
- [ ] JWT_SECRET_KEY is strong (64+ characters)
- [ ] DEBUG_MODE = false in production
- [ ] CORS_ORIGINS whitelists only your domains
- [ ] HTTPS enforced (automatic on Railway/Vercel)
- [ ] Database connection uses SSL (sslmode=require)
- [ ] Password hashing with bcrypt (cost factor 12)

### Frontend Security
- [ ] No sensitive data in client-side code
- [ ] Environment variables use NEXT_PUBLIC_ prefix correctly
- [ ] Cookies not used for sensitive data (localStorage used)
- [ ] HTTPS enforced

### Database Security
- [ ] Strong database password
- [ ] SSL connection required
- [ ] Connection pooling configured (if needed)
- [ ] Regular backups (Neon handles this)

---

## Part 7: Performance Optimization

### Backend Optimization

**Database Connection Pooling**:
```python
# In database.py
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=20,  # Increase for production
    max_overflow=40,
    pool_pre_ping=True  # Verify connections
)
```

**Response Compression**:
```python
# In main.py
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Frontend Optimization

**Image Optimization** (Next.js):
```javascript
// Use next/image component
import Image from 'next/image'

<Image src="/logo.png" width={200} height={50} alt="Logo" />
```

**Bundle Size Analysis**:
```bash
cd frontend
npm run build
# Analyze .next/analyze/ report
```

---

## Part 8: Troubleshooting

### Issue: Backend returns 500 errors

**Check**:
1. Railway logs for errors
2. Database connection: `DATABASE_URL` correct?
3. Migrations ran: `alembic current`
4. JWT_SECRET_KEY set

### Issue: Frontend can't connect to backend

**Check**:
1. `NEXT_PUBLIC_API_URL` correct in Vercel
2. Backend URL accessible: `curl https://backend-url/health`
3. CORS_ORIGINS includes Vercel domain
4. No mixed content (HTTPS vs HTTP)

### Issue: Token refresh not working

**Check**:
1. `refresh_token` in localStorage
2. Backend `/api/auth/refresh` endpoint working
3. Network tab shows refresh call
4. JWT_SECRET_KEY same between requests

### Issue: Database connection refused

**Check**:
1. Neon database active (not paused)
2. `DATABASE_URL` correct
3. SSL mode enabled: `sslmode=require`
4. IP whitelisting (if Neon requires)

---

## Part 9: Rollback Plan

### Backend Rollback

**Railway**:
1. Go to Deployments tab
2. Click on previous successful deployment
3. Click "Redeploy"

**Manual**:
```bash
git revert HEAD
git push origin 001-professional-audit
```

### Frontend Rollback

**Vercel**:
1. Go to Deployments tab
2. Click "Promote" on previous deployment
3. Or "Rollback" to revert

---

## Part 10: Scaling Considerations

### Backend Scaling

**Vertical Scaling**:
- Upgrade Railway plan for more CPU/memory
- Add more database connections

**Horizontal Scaling** (future):
- Deploy multiple backend instances
- Use load balancer
- Share session state (not needed for JWT)

### Database Scaling

**Neon Autoscaling**:
- Automatically scales based on load
- Upgrade plan for higher limits

### Frontend Scaling

- Vercel handles automatically
- CDN distribution global
- Edge functions for dynamic routes

---

## Summary

**Deployment Checklist**:
- [ ] Neon database created and migrations run
- [ ] Backend deployed to Railway
- [ ] Backend environment variables configured
- [ ] Backend health check passing
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables configured
- [ ] CORS updated with production domains
- [ ] End-to-end testing completed
- [ ] Monitoring configured
- [ ] Security checklist verified

---

**Generated**: 2026-01-18
**Branch**: 001-professional-audit
**Phase**: II-N (Neon Migration) - Deployment ready

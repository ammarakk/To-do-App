# Backend Environment Configuration Template

**Purpose**: Environment variables template for FastAPI backend with Supabase JWT auth

---

## File: `backend/.env.example`

```bash
# ============================================================
# SUPABASE CONFIGURATION
# ============================================================
# Your Supabase project URL (from Settings > API)
SUPABASE_URL=https://your-project.supabase.co

# Supabase service role key (from Settings > API)
# ⚠️ WARNING: This key has admin privileges and must NEVER be exposed to frontend
# ⚠️ WARNING: Never commit this file to git with real values
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================================
# BACKEND CONFIGURATION
# ============================================================
# API host (default: localhost)
API_HOST=localhost

# API port (default: 8000)
API_PORT=8000

# CORS allowed origins (comma-separated list)
# Add your frontend domains here for production
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ============================================================
# ENVIRONMENT
# ============================================================
# Environment: development, staging, or production
ENVIRONMENT=development

# ============================================================
# OPTIONAL: LOGGING
# ============================================================
# Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL
# LOG_LEVEL=INFO
```

---

## File: `backend/.env` (Local Development)

```bash
# Copy this from .env.example and fill in your actual values
# ⚠️ NEVER commit this file to git

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

API_HOST=localhost
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

---

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY`

---

## Security Best Practices

1. **Never commit `.env` to git** - Add to `.gitignore`
2. **Use different keys for each environment** (dev, staging, prod)
3. **Rotate keys regularly** - Especially after suspected exposure
4. **Never use `anon` key in backend** - Only `service_role` for server-side
5. **Monitor access logs** - Watch for unusual API activity

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | ✅ Yes | - | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | - | Admin key for backend operations |
| `API_HOST` | No | `localhost` | API server host |
| `API_PORT` | No | `8000` | API server port |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Allowed frontend origins |
| `ENVIRONMENT` | No | `development` | Runtime environment |
